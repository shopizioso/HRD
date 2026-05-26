// Frontend Encryption Utilities
// Note: For production, use a proper crypto library like TweetNaCl.js or libsodium.js

export function encryptField(value, key = null) {
  // Simple base64 encoding (use proper encryption in production)
  try {
    return btoa(JSON.stringify(value));
  } catch (error) {
    console.error('Encryption error:', error);
    return value;
  }
}

export function decryptField(encrypted, key = null) {
  // Simple base64 decoding (use proper decryption in production)
  try {
    return JSON.parse(atob(encrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted;
  }
}

// Sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = [
  'bank_account',
  'bank_account_name',
  'tax_id',
  'password',
  'password_hash',
  'access_token',
  'refresh_token'
];

export function encryptSensitiveData(data) {
  const encrypted = { ...data };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  });
  
  return encrypted;
}

export function decryptSensitiveData(data) {
  const decrypted = { ...data };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decryptField(decrypted[field]);
      } catch (error) {
        // If decryption fails, keep original value
      }
    }
  });
  
  return decrypted;
}

// Hash password for local validation (not for storage)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate secure random token
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate password strength
export function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+-=[\]{};':"\\|,.<>/?]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;
  
  return {
    score: strength,
    checks,
    isStrong: strength >= 4,
    message: strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'
  };
}

// Clear sensitive data from memory
export function clearSensitiveData(obj) {
  const cleaned = { ...obj };
  
  SENSITIVE_FIELDS.forEach(field => {
    if (cleaned[field]) {
      cleaned[field] = null;
    }
  });
  
  return cleaned;
}
