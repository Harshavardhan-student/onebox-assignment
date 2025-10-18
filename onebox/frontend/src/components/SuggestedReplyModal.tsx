import React, { useEffect, useState } from 'react'

export default function SuggestedReplyModal({
  emailId,
  body,
  onClose,
}: {
  emailId: string | undefined
  body: string | undefined
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function fetchReply() {
      if (!emailId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:5000/emails/${encodeURIComponent(emailId)}/suggest-reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: body || '' }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        const data = await res.json()
        const text = data.reply || data?.choices?.[0]?.text || data?.message || ''
        if (active) setReply(text)
      } catch (err: any) {
        if (active) setError(err.message || String(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchReply()
    return () => { active = false }
  }, [emailId])

  if (!emailId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded shadow-lg z-10 w-full max-w-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Suggested Reply</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="mt-4">
          {loading && (
            <div className="flex items-center text-sm text-gray-600">
              <span
                className="inline-block w-4 h-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"
                role="status"
                aria-label="Loading"
              />
              <span>Generating reply...</span>
            </div>
          )}
          {error && <div className="text-sm text-red-600">Error: {error}</div>}
          {reply && <div className="whitespace-pre-wrap text-sm text-gray-900 mt-2">{reply}</div>}
        </div>
      </div>
    </div>
  )
}
