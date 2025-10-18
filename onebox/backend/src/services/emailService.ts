import { EmailDoc, Category } from '../types/email'
import { indexEmail } from './elasticsearchService'
import { categorizeEmail } from './aiService'
import { sendSlackMessage } from './slackService'
import { triggerWebhook } from './webhookService'

// Simple in-memory store for safe testing when Elasticsearch isn't available
const store: Record<string, EmailDoc> = {}

export function upsertEmail(doc: EmailDoc) {
  store[doc.id] = { ...(store[doc.id] || {}), ...doc }
  // try indexing to elasticsearch but don't fail if ES is down
  try {
    indexEmail(store[doc.id]).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Elasticsearch indexing failed:', err.message || err)
    })
  } catch (err: any) {
    // ignore
  }
  return store[doc.id]
}

export function getEmail(id: string): EmailDoc | undefined {
  return store[id]
}

export function getAll() {
  return store
}

export async function categorizeAndNotify(id: string, text: string) {
  const e = getEmail(id) || { id }
  const categoryText = await categorizeEmail(text || '')
  // normalize category
  const cat = normalizeCategory(categoryText)
  e.category = cat

  // Only trigger notifications the first time it's set to Interested
  if (cat === 'Interested' && !e.notifiedInterested) {
    e.notifiedInterested = true
    // best-effort notify
    try {
      await sendSlackMessage(`Email ${id} marked Interested. Subject: ${e.subject || ''}`)
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('Slack notification failed:', err.message || err)
    }
    try {
      await triggerWebhook({ id, category: cat, subject: e.subject, from: e.from })
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('Webhook trigger failed:', err.message || err)
    }
  }

  upsertEmail(e)
  // also try to index updated document in ES (best-effort)
  try {
    indexEmail(e).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Elasticsearch indexing failed:', err.message || err)
    })
  } catch (err: any) {
    // ignore
  }
  return e
}

function normalizeCategory(text: string): Category {
  if (!text) return 'Unknown'
  const t = text.toLowerCase()
  if (t.includes('interested')) return 'Interested'
  if (t.includes('meeting')) return 'Meeting Booked'
  if (t.includes('not interested') || t.includes('notinterested')) return 'Not Interested'
  if (t.includes('spam')) return 'Spam'
  if (t.includes('out of office') || t.includes('out-of-office') || t.includes('ooo')) return 'Out of Office'
  // fallback: check exact labels
  const known: Category[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office']
  for (const k of known) if (t === k.toLowerCase()) return k
  return 'Unknown'
}
