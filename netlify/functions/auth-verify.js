const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { hashPassword, extractHashInfo, validateCredentials, findUserByUsername } = require('./_shared/auth');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
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
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
