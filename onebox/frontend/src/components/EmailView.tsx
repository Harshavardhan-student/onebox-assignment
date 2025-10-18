import React, { useState } from 'react'
import CategoryBadge, { Category } from './CategoryBadge'

type Email = {
  id?: string
  from?: string
  to?: string
  subject?: string
  body?: string
  date?: string
  category?: Category | string | null
}

export default function EmailView({ email, onSuggest, onUpdate }: { email?: Email | null, onSuggest?: () => void, onUpdate?: (email: Email) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!email) {
    return <div className="p-4">Select an email to view details</div>
  }

  const categories: Category[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office']

  async function categorize(cat: Category) {
    if (!email?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:5000/emails/${encodeURIComponent(email.id)}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: email.subject, body: email.body, from: email.from, to: email.to, date: email.date }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const data = await res.json()
      const updated: Email = data?.email || { ...email, category: data?.category }
      // optimistic update to parent
      onUpdate?.(updated)
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-600">From: {email.from}</div>
          <div className="text-sm text-gray-600">To: {email.to}</div>
          <div className="font-bold text-lg mt-2">{email.subject}</div>
          <div className="mt-2">
            <CategoryBadge category={email.category as string} />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button onClick={onSuggest} className="px-4 py-2 bg-blue-600 text-white rounded">Suggest Reply</button>
          <div>
            <select
              disabled={loading}
              className="px-3 py-2 border rounded"
              onChange={(e) => categorize(e.target.value as Category)}
              value={(email.category as string) || ''}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">Error categorizing: {error}</div>}

      <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{email.body}</div>
    </div>
  )
}
