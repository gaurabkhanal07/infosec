const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { decryptRailFence } = require('./_shared/railFence');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
    const result = decryptRailFence(body.ciphertext ?? body.text, body.rails);
    return jsonResponse(200, result);
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
