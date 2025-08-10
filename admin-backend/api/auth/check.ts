import type { VercelRequest, VercelResponse } from '@vercel/node';

function isValidSession(cookie: string): boolean {
  try {
    const decoded = Buffer.from(cookie, 'base64').toString();
    const [user, timestamp] = decoded.split(':');
    const now = Date.now();
    const sessionAge = now - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    return user === 'admin' && sessionAge < maxAge;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with credentials - wildcard pattern for all Vercel workspace deployments
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://workspace-nu-ecru.vercel.app",
    /^https?:\/\/([a-zA-Z0-9-]+\.)?replit\.dev$/,
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  const isAllowedOrigin = allowedOrigins.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );

  if (!isAllowedOrigin) {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vercel-protection-bypass");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for session cookie
    const cookies = req.headers.cookie?.split(';').map((c: string) => c.trim()) || [];
    const sessionCookie = cookies.find((c: string) => c.startsWith('admin-session='));
    
    if (sessionCookie) {
      const sessionValue = sessionCookie.split('=')[1];
      const isAuthenticated = isValidSession(sessionValue);
      
      res.json({ isAuthenticated });
    } else {
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ isAuthenticated: false });
  }
}