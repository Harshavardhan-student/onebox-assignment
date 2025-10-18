import express from 'express';
import { searchEmails } from '../services/elasticsearchService';
import { suggestReply } from '../services/aiService';
import { categorizeAndNotify, upsertEmail, getEmail } from '../services/emailService';

import { EmailDoc } from '../types/email'

// local in-memory store fallback
import * as emailService from '../services/emailService'

const router = express.Router();

// GET /emails - list (basic search / scan)
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const folder = req.query.folder as string | undefined
    const account = req.query.account as string | undefined
    // try ES first
    try {
      const resp = await searchEmails(q || '*', { folder, account })
      res.json(resp)
      return
    } catch (err) {
      // fallback to in-memory
    }

    const all = Object.values((emailService as any).getAll ? (emailService as any).getAll() : {}) as EmailDoc[]
    const filtered = all.filter((e) => {
      if (folder && e.folder !== folder) return false
      if (account && e.account !== account) return false
      if (!q) return true
      const text = `${e.subject || ''} ${e.body || ''}`.toLowerCase()
      return text.includes(q.toLowerCase())
    })
    res.json({ total: filtered.length, hits: filtered })
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /emails/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const folder = req.query.folder as string | undefined
    const account = req.query.account as string | undefined
    try {
      const resp = await searchEmails(q || '*', { folder, account })
      res.json(resp)
      return
    } catch (err) {
      // fallback to in-memory
    }

    const all = Object.values((emailService as any).getAll ? (emailService as any).getAll() : {}) as EmailDoc[]
    const filtered = all.filter((e) => {
      if (folder && e.folder !== folder) return false
      if (account && e.account !== account) return false
      if (!q) return true
      const text = `${e.subject || ''} ${e.body || ''}`.toLowerCase()
      return text.includes(q.toLowerCase())
    })
    res.json({ total: filtered.length, hits: filtered })
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /emails/:id/categorize
router.post('/:id/categorize', async (req, res) => {
  try {
    const id = req.params.id;
    const { subject, body, from, to, date } = req.body || {};
    // upsert minimal email info so notifications have context
    upsertEmail({ id, subject, body, from, to, date });
    const updated = await categorizeAndNotify(id, `${subject || ''}\n\n${body || ''}`);
    res.json({ id, email: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /emails/:id/suggest-reply
router.post('/:id/suggest-reply', async (req, res) => {
  try {
    const id = req.params.id;
    const { body } = req.body;
    // For RAG, simple static context
    const contextDocs = [
      'If the lead is interested, share the meeting booking link: https://cal.com/example'
    ];
    const reply = await suggestReply(body || '', contextDocs);
    res.json({ id, reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
