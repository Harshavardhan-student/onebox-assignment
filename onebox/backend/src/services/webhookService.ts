import axios from 'axios';

export async function triggerWebhook(payload: any) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  await axios.post(url, payload);
}
