const crypto = require('crypto');

let cachedStore = null;

async function getUserStore() {
  if (cachedStore) {
    return cachedStore;
  }

  const blobsModule = await import('@netlify/blobs');
  cachedStore = blobsModule.getStore('cryptography-users', {
    consistency: 'strong'
  });

  return cachedStore;
}

function normalizeAlgorithm(algorithm) {
  const value = String(algorithm ?? 'sha256').toLowerCase();
  if (value !== 'sha256' && value !== 'md5') {
    throw new Error('Unsupported hash algorithm. Use sha256 or md5.');
  }

  return value;
}

function hashPassword(password, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(password).digest('hex');
}

function buildHashRecord(password, algorithm) {
  const normalizedAlgorithm = normalizeAlgorithm(algorithm);
  const digest = hashPassword(password, normalizedAlgorithm);

  return {
    algorithm: normalizedAlgorithm,
    digest,
    storedValue: `${normalizedAlgorithm}$${digest}`
  };
}

function extractHashInfo(storedValue) {
  if (typeof storedValue !== 'string' || !storedValue.includes('$')) {
    return { algorithm: 'sha256', digest: String(storedValue ?? '') };
  }

  const [algorithm, digest] = storedValue.split('$');
  return { algorithm, digest };
}

function validateCredentials(username, password) {
  const normalizedUsername = String(username ?? '').trim();
  const normalizedPassword = String(password ?? '');

  if (!normalizedUsername) {
    throw new Error('Username is required');
  }

  if (!normalizedPassword) {
    throw new Error('Password is required');
  }

  return {
    username: normalizedUsername,
    password: normalizedPassword
  };
}

function usernameKey(username) {
  return `users/${String(username).trim().toLowerCase()}`;
}

async function findUserByUsername(username) {
  const key = usernameKey(username);
  const userStore = await getUserStore();
  return userStore.get(key, { type: 'json' });
}

async function createUser(user) {
  const record = {
    id: crypto.randomUUID(),
    username: String(user.username).trim(),
    password_hash: String(user.password_hash)
  };

  const key = usernameKey(record.username);
  const userStore = await getUserStore();
  const { modified } = await userStore.setJSON(key, record, { onlyIfNew: true });

  if (!modified) {
    throw new Error('Username already exists');
  }

  return record;
}

module.exports = {
  normalizeAlgorithm,
  hashPassword,
  buildHashRecord,
  extractHashInfo,
  validateCredentials,
  findUserByUsername,
  createUser
};
