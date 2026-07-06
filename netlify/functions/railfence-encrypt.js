const { jsonResponse, errorResponse, readJsonBody } = require('./_shared/http');
const { encryptRailFence } = require('./_shared/railFence');

exports.handler = async function handler(event) {
  try {
    const body = await readJsonBody(event);
    const result = encryptRailFence(body.plaintext ?? body.text, body.rails);
    return jsonResponse(200, result);
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
