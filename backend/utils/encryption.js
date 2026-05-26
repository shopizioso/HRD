import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || '1234567890123456';

export function encryptData(data) {
  try {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      Buffer.from(ENCRYPTION_IV, 'utf8')
    );
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export function decryptData(encryptedData) {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      Buffer.from(ENCRYPTION_IV, 'utf8')
    );
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + ENCRYPTION_KEY).digest('hex');
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
