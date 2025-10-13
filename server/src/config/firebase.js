import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIRESTORE_CREDENTIALS_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIRESTORE_PROJECT_ID
});

export const db = admin.firestore();

// Configure TTL policy
export const BOARD_TTL_DAYS = parseInt(process.env.DEFAULT_BOARD_TTL_DAYS || '7', 10);
