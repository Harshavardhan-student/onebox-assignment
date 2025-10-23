import React, { useEffect, useState } from 'react'

type Email = {
  id?: string
  accountId?: string
  folder?: string
  from?: string
  to?: string
  subject?: string
  body?: string
  date?: string
  category?: string | null
}

export default function EmailList({ searchQuery, onSelect, filters }: { searchQuery?: string, onSelect?: (email: Email) => void, filters?: { folder?: string, account?: string } }) {
  const [emails, setEmails] = useState<Email[]>([])
  const [totalHits, setTotalHits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Email | null>(null)
  const [suggestedReplies, setSuggestedReplies] = useState<Record<string, string>>({})
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        // build url with filters
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (filters?.folder) params.set('folder', filters.folder)
        if (filters?.account) params.set('account', filters.account)
        const url = `/api/emails/search?${params.toString()}`
        const res = await fetch(url, { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        const data = await res.json()
        // Normalize ES response { total, hits }
        let items: any[] = []
        if (Array.isArray(data)) items = data
        else if (data.hits && Array.isArray(data.hits)) items = data.hits
        else if (data.hits && Array.isArray(data.hits.hits)) items = data.hits.hits.map((h: any) => h._source || h)
        else if (data.hits && data.hits.hits) items = data.hits.hits.map((h: any) => h._source || h)
        else items = data?.items || data?.documents || data?.results || (data._source ? [data._source] : [])

        const normalized: Email[] = items.map((it: any, idx: number) => ({
          id: it.id || it._id || String(idx),
          accountId: it.account || it.accountId,
          folder: it.folder,
          from: it.from || (it.envelope && Array.isArray(it.envelope.from) ? it.envelope.from.map((f:any)=>f.address).join(', ') : it.from),
          to: it.to,
          subject: it.subject || '',
          body: it.body || '',
          date: it.date || it.internalDate,
          category: it.category ?? it.aiCategory ?? null,
        }))

        // capture total if available
        const total = data?.total ?? data?.hits?.total ?? null
        if (active) {
          setEmails(normalized)
          setTotalHits(typeof total === 'number' ? total : (total && total.value ? total.value : normalized.length))
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // request was aborted; ignore
          return
        }
        setError(err.message || String(err))
        setEmails([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
      controller.abort()
    }
  }, [searchQuery])

  async function suggestReply(email: Email) {
    if (!email || !email.id) return
    setReplyLoading((s) => ({ ...s, [email.id!]: true }))
    try {
      const res = await fetch(`/api/emails/${encodeURIComponent(email.id)}/suggest-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: email.body || '' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const data = await res.json()
      const reply = data.reply || data?.choices?.[0]?.text || data?.message || ''
      setSuggestedReplies((s) => ({ ...s, [email.id!]: reply }))
      setSelected((prev) => (prev && prev.id === email.id ? { ...prev } : email))
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setReplyLoading((s) => ({ ...s, [email.id!]: false }))
    }
  }

  return (
    <div className="p-2">
      <h3 className="font-bold text-lg">Inbox</h3>

      {loading && (
        <div className="space-y-3 mt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="p-3 my-2 text-sm bg-red-100 text-red-800 rounded">Error loading emails: {error}</div>
      )}

      {!loading && emails.length === 0 && !error && (
        <div className="p-4 bg-white rounded shadow-sm">No emails found.</div>
      )}

      {totalHits !== null && (
        <div className="text-sm text-gray-600 mb-2">{totalHits} result{totalHits === 1 ? '' : 's'}</div>
      )}

      <ul className="divide-y divide-gray-200 mt-3">
        {(emails.length > 0 ? emails : [
          { id: 'placeholder-1', from: 'alice@example.com', subject: 'Welcome to Onebox', aiCategory: 'Interested', body: 'Hi, I am interested in your product.' }
        ]).map((email) => (
          <li key={email.id} className="py-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-600 cursor-pointer" onClick={() => onSelect?.(email)}>{email.from}</div>
                <div className="font-medium cursor-pointer" onClick={() => onSelect?.(email)}>{email.subject || '(no subject)'}</div>
                <div className="mt-1 text-xs text-gray-500">{email.date ? new Date(email.date).toLocaleString() : ''}</div>
                <div className="mt-2">
                  {email.category ? (
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs">{email.category}</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">Uncategorized</span>
                  )}
                </div>
              </div>

              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => suggestReply(email)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={replyLoading[email.id || '']}
                >
                  {replyLoading[email.id || ''] ? 'Generating...' : 'Suggest Reply'}
                </button>
              </div>
            </div>

            {suggestedReplies[email.id || ''] && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">AI suggested reply:</div>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{suggestedReplies[email.id || '']}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
