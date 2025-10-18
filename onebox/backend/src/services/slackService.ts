import axios from 'axios';

export async function sendSlackMessage(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  await axios.post(url, { text });
}
