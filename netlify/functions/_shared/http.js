function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(data)
  };
}

function errorResponse(statusCode, message) {
  return jsonResponse(statusCode, { error: message });
}

async function readJsonBody(event) {
  if (!event.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody);
}

module.exports = {
  jsonResponse,
  errorResponse,
  readJsonBody
};
