import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// TODO: Configure TELEGRAM_BOT_TOKEN in .env for production verification
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim().replace(/^["']|["']$/g, '');
const JWT_SECRET = (process.env.JWT_SECRET || 'azurlizeteam_secret_jwt_key_2026').trim().replace(/^["']|["']$/g, '');

app.use(express.json());

// HMAC SHA-256 verification function for Telegram WebApp initData
function verifyTelegramInitData(initData: string): { valid: boolean; user?: unknown; error?: string } {
  if (!initData) {
    return { valid: false, error: 'Missing initData string' };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return { valid: false, error: 'Hash parameter missing from initData' };
    }

    urlParams.delete('hash');

    // If bot token is not yet configured, allow validation in development mode with clear log
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('[Telegram Auth] TELEGRAM_BOT_TOKEN is not configured. Running in unverified development mode.');
      const userString = urlParams.get('user');
      const user = userString ? JSON.parse(userString) : null;
      return { valid: true, user };
    }

    // Sort parameters alphabetically
    const params: string[] = [];
    urlParams.forEach((val, key) => {
      params.push(`${key}=${val}`);
    });
    params.sort();

    const dataCheckString = params.join('\n');

    // HMAC-SHA256 calculation
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(TELEGRAM_BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash === hash) {
      const userString = urlParams.get('user');
      const user = userString ? JSON.parse(userString) : null;
      return { valid: true, user };
    } else {
      return { valid: false, error: 'HMAC signature verification failed' };
    }
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Failed to parse initData' };
  }
}

// Middleware to protect API routes with JWT session token
function authenticateJWT(req: Request & { user?: unknown }, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Session token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired session token' });
  }
}

// API Endpoint: Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'AzurLizeTeam Mini Web App',
    telegramVerificationReady: Boolean(TELEGRAM_BOT_TOKEN),
    timestamp: new Date().toISOString()
  });
});

// API Endpoint: Verify Telegram initData & Issue JWT Session Token
app.post('/api/auth/verify-telegram', (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    res.status(400).json({ success: false, error: 'initData is required' });
    return;
  }

  const verification = verifyTelegramInitData(initData);
  if (!verification.valid) {
    res.status(401).json({ success: false, error: verification.error || 'Invalid Telegram initData' });
    return;
  }

  const user = verification.user as { id: number; username?: string; first_name?: string };
  if (!user || !user.id) {
    res.status(400).json({ success: false, error: 'Telegram user ID not found in initData' });
    return;
  }

  // Issue JWT Session Token valid for 7 days
  const token = jwt.sign(
    {
      telegramId: String(user.id),
      username: user.username || '',
      firstName: user.first_name || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      token,
      telegramUser: user,
      verified: true
    }
  });
});

// API Endpoint: User Registration Session Verification
app.post('/api/auth/session-user', authenticateJWT, (req: Request & { user?: unknown }, res: Response) => {
  res.json({
    success: true,
    data: {
      sessionUser: req.user
    }
  });
});

// Start Express Server and mount Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.js') {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (ext === '.css') {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (ext === '.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        } else if (ext === '.png') {
          res.setHeader('Content-Type', 'image/png');
        } else if (ext === '.jpg' || ext === '.jpeg') {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (ext === '.svg') {
          res.setHeader('Content-Type', 'image/svg+xml');
        } else if (ext === '.ico') {
          res.setHeader('Content-Type', 'image/x-icon');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen and mount static/dev middleware if not running on Vercel as a Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[AzurLizeTeam Server] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
