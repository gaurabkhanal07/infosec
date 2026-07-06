function normalizeRails(rails) {
  const value = Number.parseInt(rails, 10);
  if (!Number.isInteger(value) || value < 2) {
    throw new Error('Rails must be an integer greater than 1');
  }
  return value;
}

function buildRailFenceMatrix(text, rails) {
  const matrix = Array.from({ length: rails }, () => Array(text.length).fill(''));
  const pattern = [];
  let row = 0;
  let direction = 1;

  for (let column = 0; column < text.length; column += 1) {
    matrix[row][column] = text[column];
    pattern.push(row);

    if (row === 0) {
      direction = 1;
    } else if (row === rails - 1) {
      direction = -1;
    }

    row += direction;
  }

  return { matrix, pattern };
}

function encryptRailFence(plaintext, railsInput) {
  const plaintextText = String(plaintext ?? '').trim();
  const rails = normalizeRails(railsInput);

  if (!plaintextText) {
    throw new Error('Plaintext is required');
  }

  const { matrix, pattern } = buildRailFenceMatrix(plaintextText, rails);
  let ciphertext = '';

  for (let row = 0; row < rails; row += 1) {
    for (let column = 0; column < plaintextText.length; column += 1) {
      if (matrix[row][column]) {
        ciphertext += matrix[row][column];
      }
    }
  }

  return {
    plaintext: plaintextText,
    rails,
    ciphertext,
    matrix,
    pattern,
    steps: {
      traversal: pattern,
      note: 'Characters are placed on a zig-zag path across the rails and then read row by row.'
    }
  };
}

function decryptRailFence(ciphertext, railsInput) {
  const ciphertextText = String(ciphertext ?? '').trim();
  const rails = normalizeRails(railsInput);

  if (!ciphertextText) {
    throw new Error('Ciphertext is required');
  }

  const markers = Array.from({ length: rails }, () => Array(ciphertextText.length).fill(false));
  let row = 0;
  let direction = 1;

  for (let column = 0; column < ciphertextText.length; column += 1) {
    markers[row][column] = true;

    if (row === 0) {
      direction = 1;
    } else if (row === rails - 1) {
      direction = -1;
    }

    row += direction;
  }

  const matrix = Array.from({ length: rails }, () => Array(ciphertextText.length).fill(''));
  let index = 0;

  for (let currentRow = 0; currentRow < rails; currentRow += 1) {
    for (let column = 0; column < ciphertextText.length; column += 1) {
      if (markers[currentRow][column]) {
        matrix[currentRow][column] = ciphertextText[index];
        index += 1;
      }
    }
  }

  let plaintext = '';
  row = 0;
  direction = 1;

  for (let column = 0; column < ciphertextText.length; column += 1) {
    plaintext += matrix[row][column];

    if (row === 0) {
      direction = 1;
    } else if (row === rails - 1) {
      direction = -1;
    }

    row += direction;
  }

  return {
    ciphertext: ciphertextText,
    rails,
    plaintext,
    matrix,
    steps: {
      note: 'The zig-zag pattern is reconstructed first, then the ciphertext is filled row by row before reading the rails again.'
    }
  };
}

module.exports = {
  normalizeRails,
  buildRailFenceMatrix,
  encryptRailFence,
  decryptRailFence
};
