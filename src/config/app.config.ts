export const APP_CONFIG = {
  name: 'The Hashi Puzzle',
  version: '1.0.0',
  author: 'GianRaHu',
  timestamp: '2025-03-13 09:27:17',
  apiEndpoint: process.env.VITE_API_ENDPOINT || 'https://api.gpteng.co',
  security: {
    maxAttempts: 5,
    lockoutDuration: 300000, // 5 minutes
    apiTimeout: 10000, // 10 seconds
  },
  storage: {
    prefix: 'thehashipuzzle_',
    version: 1,
  },
  game: {
    minGridSize: 5,
    maxGridSize: 12,
    maxBridges: 2,
    difficulties: ['easy', 'medium', 'hard', 'expert', 'master'],
  }
};

export const SECURITY_HEADERS = {
  'Content-Security-Policy': 
    "default-src 'self' https://cdn.gpteng.co; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://api.gpteng.co;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
