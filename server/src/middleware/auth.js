export function verifyFacilitator(req, res, next) {
  const token = req.headers['x-facilitator-token'];

  if (!token) {
    return res.status(401).json({ error: 'Facilitator token required' });
  }

  req.facilitatorToken = token;
  next();
}

export function extractClientId(req, res, next) {
  const clientId = req.headers['x-client-id'];

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID required' });
  }

  req.clientId = clientId;
  next();
}
