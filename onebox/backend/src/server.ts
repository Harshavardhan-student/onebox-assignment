import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import emailsRouter from './routes/emails';
import logger from './utils/logger';
import { startImapSync } from './services/imapService';

const app = express();

// Enable CORS for all origins (development). Adjust in production as needed.
app.use(cors());

app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/emails', emailsRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server listening on ${port}`);
  // start background IMAP sync (non-blocking)
  startImapSync().catch((e) => logger.error('IMAP sync failed: ' + e.message));
});
