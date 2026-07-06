const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { encryptMessage } = require('./_shared/rsa');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
    return jsonResponse(200, encryptMessage(body.message, body.publicKey ?? body.key));
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
