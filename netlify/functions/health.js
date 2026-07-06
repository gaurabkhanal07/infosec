const { jsonResponse } = require('./_shared/http');

exports.handler = async function handler() {
  return jsonResponse(200, { status: 'ok' });
};
