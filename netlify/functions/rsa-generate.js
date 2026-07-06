const { jsonResponse, errorResponse } = require('./_shared/http');
const { generateKeys } = require('./_shared/rsa');

exports.handler = async function handler() {
  try {
    return jsonResponse(200, generateKeys());
  } catch (error) {
    return errorResponse(400, error.message);
  }
};
