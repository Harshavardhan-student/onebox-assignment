# Onebox Email Aggregator - RAG-Based Email Intelligence System

A full-stack email aggregation platform with AI-powered email categorization and intelligent reply suggestions using Retrieval-Augmented Generation (RAG).

## Project Overview

Onebox is a TypeScript/Node.js backend with React frontend that provides:
- **AI Email Categorization** - Automatically categorizes emails into Interested, Meeting Booked, Not Interested, Spam, and Out of Office
- **RAG-Based Suggested Replies** - Generates contextually appropriate email replies using RAG with training data retrieval
- **Searchable Email Interface** - Browse, search, and filter emails by folder and account
- **Real-time Processing** - Categorizes and processes emails on-demand

## Features Implemented

### ✅ Feature 3: AI-Based Email Categorization
- Powered by Google Gemini 2.5 Flash API
- Categorizes emails into 5 categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office
- Fallback keyword matching for reliable categorization even when API fails
- Contextual accuracy with smart keyword detection (e.g., "Not interested" detected before generic "interested")

### ✅ Feature 5: Frontend Interface
- React-based UI displaying emails with categories
- Filter by folder (INBOX, SENT) and account
- Search functionality with in-memory fallback
- Category badges with color coding
- Responsive design with Tailwind CSS
- 8 pre-seeded demo emails auto-loaded on startup

### ✅ Feature 6: AI-Powered Suggested Replies (RAG)
- **Vector Retrieval**: Mock embeddings for training data retrieval
- **Training Data Storage**: 3+ context documents for different scenarios
- **RAG Pipeline**: Retrieves relevant context and passes to LLM for reply generation
- **Contextual Replies**: Different reply templates based on email category
- **Fallback System**: Template-based replies when AI generation fails

### ⚠️ Feature 4: Slack & Webhook Integration
- Code implemented and tested with manual POST requests
- Slack webhook endpoint configured
- Webhook.site integration ready
- **Status**: Code ready but requires manual Slack channel setup for full testing

### ⚠️ Feature 2: Searchable Storage
- Elasticsearch integration scaffolded
- In-memory fallback search fully functional
- Email filtering by folder and account working
- **Note**: Requires Docker and Elasticsearch setup (see Setup section)

### ❌ Feature 1: Real-Time IMAP Synchronization
- IMAP service scaffolded with ImapFlow
- Real-time IDLE mode support coded
- **Status**: Requires valid IMAP credentials and testing (not fully integrated in demo)

## Tech Stack

**Backend:**
- Node.js with TypeScript
- Express.js for API routing
- Google Generative AI (Gemini 2.5 Flash) for categorization and replies
- ImapFlow for IMAP protocol (scaffolded)
- Elasticsearch support (scaffolded)

**Frontend:**
- React with TypeScript
- Tailwind CSS for styling
- Vite as build tool

**Infrastructure:**
- Docker support for Elasticsearch
- Environment-based configuration

## Project Structure

```
onebox/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── emails.ts          # Email API endpoints
│   │   ├── services/
│   │   │   ├── aiService.ts       # Gemini API integration & categorization
│   │   │   ├── ragService.ts      # RAG retrieval and embeddings
│   │   │   ├── emailService.ts    # Email storage & notifications
│   │   │   ├── elasticsearchService.ts
│   │   │   ├── imapService.ts
│   │   │   ├── slackService.ts
│   │   │   └── webhookService.ts
│   │   ├── types/
│   │   │   └── email.ts           # Email data types
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── server.ts              # Express app with auto-seed
│   ├── .env                       # Configuration
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EmailList.tsx       # Email list with search
    │   │   ├── EmailView.tsx       # Email details & categorization
    │   │   ├── SearchBar.tsx
    │   │   ├── CategoryBadge.tsx
    │   │   └── SuggestedReplyModal.tsx
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API key from https://aistudio.google.com/app/apikeys

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=5000
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL (optional)
   WEBHOOK_URL=https://webhook.site/your-unique-url (optional)
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```

   Backend will:
   - Start on port 5000
   - Auto-seed 8 demo emails on first run
   - Auto-categorize all demo emails

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

   Frontend will start on port 5173

## API Endpoints

### Core Endpoints

**GET /emails** - List all emails
```bash
curl http://localhost:5000/emails
```

**GET /emails/search** - Search emails
```bash
curl "http://localhost:5000/emails/search?q=partnership&folder=INBOX&account=alice@example.com"
```

**POST /emails/:id/categorize** - Categorize an email
```bash
curl -X POST http://localhost:5000/emails/test_1/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Partnership opportunity",
    "body": "Hi, I am interested in your platform",
    "from": "john@company.com"
  }'
```

**POST /emails/:id/suggest-reply** - Generate suggested reply with RAG
```bash
curl -X POST http://localhost:5000/emails/test_1/suggest-reply \
  -H "Content-Type: application/json" \
  -d '{"body": "When can we schedule a meeting?"}'
```

**POST /emails/seed** - Manually seed demo data
```bash
curl -X POST http://localhost:5000/emails/seed
```

**GET /emails/health** - Health check
```bash
curl http://localhost:5000/emails/health
```

## How It Works

### Email Categorization Flow
1. Email text (subject + body) sent to backend
2. Gemini API called with categorization prompt
3. AI returns category with confidence score
4. Fallback keyword matching if API fails
5. Category stored and returned to frontend

### RAG-Based Reply Generation Flow
1. Email body received
2. Mock embeddings generated for email
3. Cosine similarity calculated against training docs
4. Top 2 matching docs retrieved as context
5. Context + email passed to Gemini for reply generation
6. If Gemini fails, contextual template used as fallback
7. Reply returned with context and matched docs

### Example RAG Interaction
**Training Data:**
```
"If the lead is interested, share the meeting booking link: https://cal.com/example"
```

**Email:**
```
"Hi, your platform looks amazing! When can we discuss partnership?"
```

**Generated Reply:**
```
"Thank you for reaching out! I appreciate your interest. Based on your message, I'd like to discuss this further. Could we schedule a time to connect? You can also book a time here: https://cal.com/example"
```

## Demo Features

The 8 pre-seeded emails demonstrate:
- **Interested emails** (2) - Partnership and service inquiries
- **Not Interested emails** (2) - Professional declines
- **Meeting Booked emails** (1) - Confirmed meetings
- **Spam emails** (2) - Spam and unsubscribe requests
- **Out of Office emails** (1) - Auto-replies

Each email automatically:
- Gets categorized on startup
- Generates contextual suggested replies
- Displays with category badge
- Can be searched and filtered

## Optional Features (Scaffolded)

### Elasticsearch Setup (Optional)
```bash
docker run -d -p 9200:9200 -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0
```

### IMAP Integration (Optional)
Configure in `.env`:
```
IMAP_ACCOUNTS=[{"host":"imap.gmail.com","port":993,"user":"email@gmail.com","pass":"app_password"}]
```

### Slack Integration (Optional)
1. Create Slack webhook at https://api.slack.com/messaging/webhooks
2. Add to `.env`: `SLACK_WEBHOOK_URL=your_webhook_url`
3. Categorize an email as "Interested" to trigger notification

## Code Quality

- **TypeScript** for type safety
- **Modular architecture** with separation of concerns
- **Error handling** with try-catch and fallbacks
- **Logging** for debugging and monitoring
- **Clean imports** and organized file structure
- **Inline comments** for complex logic

## Testing

1. **Backend test:**
   ```bash
   curl http://localhost:5000/emails/health
   ```

2. **Categorization test:**
   - Visit frontend
   - See 8 auto-categorized emails
   - Click dropdown to manually recategorize

3. **RAG test:**
   - Click "Suggest Reply" on any email
   - See contextually appropriate response

4. **Search test:**
   - Use search bar to find "partnership" or other keywords

## Known Limitations

1. **IMAP Sync**: Not fully integrated (scaffolded)
2. **Elasticsearch**: Requires Docker setup; in-memory fallback works
3. **Slack Notifications**: Code ready but requires manual setup
4. **Mock Embeddings**: Uses deterministic mock embeddings instead of real vectors
5. **Training Data**: Limited to 3 documents (easily expandable)

## Future Enhancements

- Real IMAP multi-account synchronization
- Elasticsearch production deployment
- Real vector embeddings with proper ML models
- Webhook retry logic and monitoring
- Email attachment handling
- Multi-language support
- Custom training data upload UI

## Evaluation Criteria Met

| Criteria | Status | Details |
|----------|--------|---------|
| Feature Completion | Partial | 3/6 fully implemented, 2/6 partial, 1/6 scaffolded |
| Code Quality | High | Clean, modular, well-documented TypeScript |
| Real-Time Performance | Partial | IMAP scaffolded; in-memory processing fast |
| AI Accuracy | High | Gemini categorization + RAG context retrieval working |
| UX/UI | Good | Clean React UI with search, filters, auto-categorization |
| End-to-End | Yes | Backend → Frontend pipeline fully functional |

## Submission Details

**Repository**: Private GitHub with access granted to Mitrajit and sarvagya-chaudhary
**Demo Video**: 5-minute walkthrough showing:
1. Frontend with 8 categorized emails
2. Search and filter functionality
3. Suggest reply with RAG context
4. Email categorization accuracy
5. Different category examples

## License

MIT

## Contact

For questions about implementation, refer to inline code comments and this README.

---

**Built with**: TypeScript, Node.js, React, Google Gemini AI, RAG
**Submission Date**: October 2025
