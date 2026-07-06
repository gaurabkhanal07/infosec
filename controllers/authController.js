const crypto = require('crypto');
const User = require('../models/userModel');

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

async function register(req, res) {
  try {
    const { username, password } = validateCredentials(req.body.username, req.body.password);
    const algorithm = normalizeAlgorithm(req.body.algorithm);
    const existingUser = User.findByUsername(username);

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashRecord = buildHashRecord(password, algorithm);
    const user = User.create({
      username,
      password_hash: hashRecord.storedValue
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username
      },
      hashPreview: {
        plaintext: password,
        algorithm: hashRecord.algorithm,
        digest: hashRecord.digest,
        storedValue: hashRecord.storedValue
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = validateCredentials(req.body.username, req.body.password);
    const user = User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const hashInfo = extractHashInfo(user.password_hash);
    const candidate = hashPassword(password, hashInfo.algorithm);
    const isMatch = candidate === hashInfo.digest;

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      },
      verification: {
        plaintext: password,
        algorithm: hashInfo.algorithm,
        candidateHash: candidate,
        storedHash: hashInfo.digest,
        match: true
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function verifyPassword(req, res) {
  try {
    const { username, password } = validateCredentials(req.body.username, req.body.password);
    const user = User.findByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashInfo = extractHashInfo(user.password_hash);
    const candidate = hashPassword(password, hashInfo.algorithm);
    const isMatch = candidate === hashInfo.digest;

    res.json({
      username,
      algorithm: hashInfo.algorithm,
      plaintext: password,
      candidateHash: candidate,
      storedHash: hashInfo.digest,
      match: isMatch
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  verifyPassword,
  hashPassword,
  buildHashRecord,
  extractHashInfo
};
