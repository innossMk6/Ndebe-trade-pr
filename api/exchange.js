// api/exchange.js
// Vercel automatically turns this into a serverless endpoint at /api/exchange
// This is the ONLY part of the OAuth flow that must run server-side.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, code_verifier, client_id, redirect_uri } = req.body;

  if (!code || !code_verifier || !client_id || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const tokenRes = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id,
        code,
        code_verifier,
        redirect_uri,
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json(data);
    }

    // data contains: access_token, expires_in, token_type
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Token exchange failed', detail: String(err) });
  }
}
