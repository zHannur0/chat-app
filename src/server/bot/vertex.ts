import { VertexAI } from '@google-cloud/vertexai';

export interface BotReplyOptions {
  projectId?: string;
  location?: string; // e.g. us-central1
  model?: string; // e.g. gemini-1.5-flash
}

export async function generateBotReply(prompt: string, opts: BotReplyOptions = {}): Promise<string> {
  const projectId = opts.projectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
  const location = opts.location || process.env.VERTEX_LOCATION || 'us-central1';
  const model = opts.model || process.env.VERTEX_MODEL || 'gemini-1.5-flash';

  if (!projectId) {
    // Fallback simple echo if not configured
    return `Echo: ${prompt}`;
  }

  try {
    const vertex = new VertexAI({ project: projectId, location });
    const generativeModel = vertex.getGenerativeModel({ model });
    const resp = await generativeModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const text = resp.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '...';
  } catch (e) {
    return `Echo: ${prompt}`;
  }
}


