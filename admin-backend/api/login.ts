import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with credentials - wildcard pattern for all Vercel workspace deployments
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://workspace-nu-ecru.vercel.app",
    // For replit, localhost, 127.0.0.1 do simple regex matches:
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vercel-protection-bypass");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password } = req.body;

    // Simple authentication check
    if (username === "admin" && password === "trex2025!") {
      // Generate simple session token
      const token = Buffer.from(`admin:${Date.now()}`).toString("base64");

      // Set cookie for session management
      res.setHeader("Set-Cookie", [
        `admin-session=${token}; HttpOnly; Secure; SameSite=None; Max-Age=604800`, // 7 days
      ]);

      res.json({
        success: true,
        message: "Login successful",
        isAuthenticated: true,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
        isAuthenticated: false,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      isAuthenticated: false,
    });
  }
}
