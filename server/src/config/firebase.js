import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db;
let useMock = false;

try {
  const credPath = process.env.FIRESTORE_CREDENTIALS_PATH;

  if (!credPath || !existsSync(credPath)) {
    throw new Error('Firebase credentials not found, using mock');
  }

  const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIRESTORE_PROJECT_ID
  });

  db = admin.firestore();
  console.log('✅ Connected to Firebase Firestore');
} catch (error) {
  console.log('⚠️  Firebase credentials not found, using in-memory mock database');
  console.log('   (Data will not persist between server restarts)');

  // Import mock firestore
  const mockModule = await import('./mockFirestore.js');
  db = mockModule.db;
  useMock = true;
}

export { db, useMock };

// Configure TTL policy
export const BOARD_TTL_DAYS = parseInt(process.env.DEFAULT_BOARD_TTL_DAYS || '7', 10);
