import React, { useState, useEffect, useRef } from 'react'
import EmailList from './components/EmailList'
import EmailView from './components/EmailView'
import SearchBar from './components/SearchBar'
import SuggestedReplyModal from './components/SuggestedReplyModal'

export default function App() {
  const [inputQ, setInputQ] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filters, setFilters] = useState<{ folder?: string, account?: string }>({})
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // debounce inputQ -> searchQuery
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(inputQ), 400)
    return () => clearTimeout(id)
  }, [inputQ])

  return (
    <div className="h-screen flex">
      <div className="w-72 border-r p-4">Accounts / Folders</div>
      <div className="flex-1 p-4">
  <SearchBar onSearch={(q) => setSearchQuery(q)} onChange={(q) => setInputQ(q)} onFilter={(f) => setFilters(f)} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <EmailList searchQuery={searchQuery} onSelect={(e) => setSelectedEmail(e)} filters={filters} />
          </div>
          <div className="col-span-2">
            <EmailView
              email={selectedEmail}
              onSuggest={() => setModalOpen(true)}
              onUpdate={(updated) => setSelectedEmail(updated)}
            />
          </div>
        </div>
      </div>

      {modalOpen && (
        <SuggestedReplyModal
          emailId={selectedEmail?.id}
          body={selectedEmail?.body}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
