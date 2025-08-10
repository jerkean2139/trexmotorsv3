import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with credentials - wildcard pattern for all Vercel workspace deployments
  const origin = req.headers.origin;
  const isAllowedOrigin = origin && (
    origin === "https://workspace-nu-ecru.vercel.app" ||
    origin.includes("replit.dev") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1")
  );
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-vercel-protection-bypass');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.json({ 
    success: true, 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    isAllowedOrigin,
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    },
    method: req.method,
    url: req.url
  });
}