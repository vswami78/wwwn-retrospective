import { nanoid } from 'nanoid';

const CLIENT_ID_KEY = 'wwwn-client-id';

export function generateClientId() {
  return nanoid();
}

export function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = generateClientId();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

export function clearClientId() {
  localStorage.removeItem(CLIENT_ID_KEY);
}
