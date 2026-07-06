const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const {
  normalizeAlgorithm,
  buildHashRecord,
  hashPassword,
  extractHashInfo,
  validateCredentials,
  findUserByUsername,
  createUser
} = require('./_shared/auth');

async function handleRegister(body) {
  const { username, password } = validateCredentials(body.username, body.password);
  const algorithm = normalizeAlgorithm(body.algorithm);
  const existingUser = await findUserByUsername(username);

  if (existingUser) {
    return errorResponse(409, 'Username already exists');
  }

  const hashRecord = buildHashRecord(password, algorithm);
  const user = await createUser({
    username,
    password_hash: hashRecord.storedValue
  });

  return jsonResponse(201, {
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
}

async function handleLogin(body) {
  const { username, password } = validateCredentials(body.username, body.password);
  const user = await findUserByUsername(username);

  if (!user) {
    return errorResponse(401, 'Invalid username or password');
  }

  const hashInfo = extractHashInfo(user.password_hash);
  const candidate = hashPassword(password, hashInfo.algorithm);
  const isMatch = candidate === hashInfo.digest;

  if (!isMatch) {
    return errorResponse(401, 'Invalid username or password');
  }

  return jsonResponse(200, {
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
}

async function handleVerify(body) {
  const { username, password } = validateCredentials(body.username, body.password);
  const user = await findUserByUsername(username);

  if (!user) {
    return errorResponse(404, 'User not found');
  }

  const hashInfo = extractHashInfo(user.password_hash);
  const candidate = hashPassword(password, hashInfo.algorithm);

  return jsonResponse(200, {
    username,
    algorithm: hashInfo.algorithm,
    plaintext: password,
    candidateHash: candidate,
    storedHash: hashInfo.digest,
    match: candidate === hashInfo.digest
  });
}

exports.handler = async function handler(event) {
  try {
    const method = (event.httpMethod || '').toUpperCase();
    if (method !== 'POST') {
      return errorResponse(405, 'Method not allowed');
    }

    const path = String(event.path || '');
    const body = await readJsonBody(event);

    if (path.endsWith('/register')) {
      return handleRegister(body);
    }

    if (path.endsWith('/login')) {
      return handleLogin(body);
    }

    if (path.endsWith('/verify')) {
      return handleVerify(body);
    }

    return errorResponse(404, 'Auth route not found');
  } catch (error) {
    return errorResponse(400, error.message);
  }
};