# Onebox Email Aggregator

## Overview
Onebox is a feature-rich email aggregator inspired by ReachInbox. It syncs multiple IMAP accounts in real-time, provides a searchable interface, categorizes emails using AI, and suggests replies using an LLM-powered RAG system.

## Features
- Real-time IMAP email synchronization (minimum 2 accounts)
- Searchable storage via Elasticsearch (supports folder/account filters)
- AI-based email categorization: Interested, Meeting Booked, Not Interested, Spam, Out of Office
- Slack & webhook notifications for "Interested" emails
- Frontend UI to view emails, filter by folder/account, and show AI categorizations
- AI-powered suggested replies (RAG implementation)

## Tech Stack
- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite, TailwindCSS
- Database: Elasticsearch (search), optional in-memory store for fallback
- AI: OpenAI API / LLM for categorization and suggested replies
- Notifications: Slack and webhooks

## Setup Instructions

### Backend

1)cd backend

2)npm install

3)npm run dev


### Frontend

1)cd frontend

2)npm install

3)npm run dev



### Notes

- Elasticsearch and IMAP are optional for testing—fallbacks exist.
- Slack/webhook notifications require valid environment variables.

### Contributors

- Harsha(Me)
