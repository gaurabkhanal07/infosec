const crypto = require('crypto');

let cachedStore = null;
const memoryUsers = new Map();

function createMemoryStoreAdapter() {
  return {
    async get(key) {
      return memoryUsers.has(key) ? memoryUsers.get(key) : null;
    },
    async setIfNew(key, value) {
      if (memoryUsers.has(key)) {
        return false;
      }

      memoryUsers.set(key, value);
      return true;
    }
  };
}

async function getUserStore() {
  if (cachedStore) {
    return cachedStore;
  }

  try {
    const blobsModule = await import('@netlify/blobs');
    const blobStore = blobsModule.getStore('cryptography-users', {
      consistency: 'strong'
    });

    cachedStore = {
      async get(key) {
        return blobStore.get(key, { type: 'json' });
      },
      async setIfNew(key, value) {
        const { modified } = await blobStore.setJSON(key, value, { onlyIfNew: true });
        return modified;
      }
    };
  } catch (error) {
    cachedStore = createMemoryStoreAdapter();
  }

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
  return userStore.get(key);
}

async function createUser(user) {
  const record = {
    id: crypto.randomUUID(),
    username: String(user.username).trim(),
    password_hash: String(user.password_hash)
  };

  const key = usernameKey(record.username);
  const userStore = await getUserStore();
  const modified = await userStore.setIfNew(key, record);

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
