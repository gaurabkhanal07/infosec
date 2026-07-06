const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { normalizeAlgorithm, buildHashRecord, validateCredentials, findUserByUsername, createUser } = require('./_shared/auth');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
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
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
