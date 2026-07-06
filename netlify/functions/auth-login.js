const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { hashPassword, extractHashInfo, validateCredentials, findUserByUsername } = require('./_shared/auth');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
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
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
