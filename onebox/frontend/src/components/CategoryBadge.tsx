import React from 'react'

export type Category = 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Unknown'

const palette: Record<string, string> = {
  Interested: 'bg-green-100 text-green-800',
  'Meeting Booked': 'bg-blue-100 text-blue-800',
  'Not Interested': 'bg-gray-100 text-gray-800',
  Spam: 'bg-red-100 text-red-800',
  'Out of Office': 'bg-yellow-100 text-yellow-800',
  Unknown: 'bg-gray-50 text-gray-700',
}

export default function CategoryBadge({ category }: { category?: string | null }) {
  const label = category || 'Unknown'
  const css = palette[label] || palette.Unknown
  return <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${css}`}>{label}</span>
}
