import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null as any;

export async function categorizeEmail(text: string) {
  if (!client) return 'Unknown';
  const prompt = `Classify the following email into one of: Interested, Meeting Booked, Not Interested, Spam, Out of Office.\n\nEmail:\n${text}`;
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  });
  return resp.choices?.[0]?.message?.content?.trim();
}

export async function suggestReply(emailBody: string, contextDocs: string[]) {
  if (!client) return 'No API key configured.';
  const prompt = `You are an assistant. Context: ${contextDocs.join('\n')}\n\nEmail: ${emailBody}\n\nWrite a concise reply.`;
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400
  });
  return resp.choices?.[0]?.message?.content?.trim();
}
