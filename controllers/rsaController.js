const crypto = require('crypto');

function toBigInt(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }

  throw new Error('Expected a numeric value');
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let currentBase = base % modulus;
  let currentExponent = exponent;

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % modulus;
    }

    currentBase = (currentBase * currentBase) % modulus;
    currentExponent /= 2n;
  }

  return result;
}

function gcd(a, b) {
  let x = a;
  let y = b;

  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }

  return x;
}

function extendedGcd(a, b) {
  if (b === 0n) {
    return { gcd: a, x: 1n, y: 0n };
  }

  const { gcd: innerGcd, x: innerX, y: innerY } = extendedGcd(b, a % b);
  return {
    gcd: innerGcd,
    x: innerY,
    y: innerX - (a / b) * innerY
  };
}

function modInverse(a, modulus) {
  const { gcd: resultGcd, x } = extendedGcd(a, modulus);
  if (resultGcd !== 1n) {
    throw new Error('No modular inverse exists for the selected values');
  }

  return ((x % modulus) + modulus) % modulus;
}

function randomBigIntBetween(min, max) {
  const range = max - min + 1n;
  const bytes = Math.ceil(range.toString(2).length / 8);

  while (true) {
    const buffer = crypto.randomBytes(bytes);
    let candidate = 0n;

    for (const byte of buffer) {
      candidate = (candidate << 8n) + BigInt(byte);
    }

    candidate = min + (candidate % range);
    if (candidate >= min && candidate <= max) {
      return candidate;
    }
  }
}

function isProbablePrime(value, rounds = 8) {
  if (value < 2n) {
    return false;
  }

  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  if (smallPrimes.includes(value)) {
    return true;
  }

  for (const prime of smallPrimes) {
    if (value % prime === 0n) {
      return false;
    }
  }

  let d = value - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  for (let i = 0; i < rounds; i += 1) {
    const a = randomBigIntBetween(2n, value - 2n);
    let x = modPow(a, d, value);

    if (x === 1n || x === value - 1n) {
      continue;
    }

    let continueOuter = false;
    for (let r = 1n; r < s; r += 1n) {
      x = modPow(x, 2n, value);
      if (x === value - 1n) {
        continueOuter = true;
        break;
      }
    }

    if (!continueOuter) {
      return false;
    }
  }

  return true;
}

function generatePrime(bits = 16) {
  const lowerBound = 1n << BigInt(bits - 1);
  const upperBound = (1n << BigInt(bits)) - 1n;

  while (true) {
    let candidate = randomBigIntBetween(lowerBound, upperBound) | 1n;
    if (isProbablePrime(candidate)) {
      return candidate;
    }
  }
}

function generateKeyPair() {
  const p = generatePrime(16);
  let q = generatePrime(16);

  while (q === p) {
    q = generatePrime(16);
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  let e = 65537n;

  if (gcd(e, phi) !== 1n) {
    e = 3n;
    while (gcd(e, phi) !== 1n) {
      e += 2n;
    }
  }

  const d = modInverse(e, phi);

  return {
    p,
    q,
    n,
    phi,
    e,
    d
  };
}

function parsePublicKey(input) {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    const [e, n] = input;
    return { e: toBigInt(e), n: toBigInt(n) };
  }

  if (typeof input === 'object') {
    return { e: toBigInt(input.e), n: toBigInt(input.n) };
  }

  if (typeof input === 'string') {
    const parts = input.split(',').map(part => part.trim());
    if (parts.length === 2) {
      return { e: toBigInt(parts[0]), n: toBigInt(parts[1]) };
    }
  }

  throw new Error('Public key must contain e and n');
}

function parsePrivateKey(input) {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    const [d, n] = input;
    return { d: toBigInt(d), n: toBigInt(n) };
  }

  if (typeof input === 'object') {
    return { d: toBigInt(input.d), n: toBigInt(input.n) };
  }

  if (typeof input === 'string') {
    const parts = input.split(',').map(part => part.trim());
    if (parts.length === 2) {
      return { d: toBigInt(parts[0]), n: toBigInt(parts[1]) };
    }
  }

  throw new Error('Private key must contain d and n');
}

function encodeMessage(message, n) {
  const values = Array.from(message).map(character => BigInt(character.codePointAt(0)));
  if (values.some(value => value >= n)) {
    throw new Error('Message contains a character that is too large for the generated modulus');
  }
  return values;
}

function generateKeys(req, res) {
  try {
    const keyPair = generateKeyPair();

    res.json({
      publicKey: { e: keyPair.e.toString(), n: keyPair.n.toString() },
      privateKey: { d: keyPair.d.toString(), n: keyPair.n.toString() },
      steps: {
        p: keyPair.p.toString(),
        q: keyPair.q.toString(),
        n: keyPair.n.toString(),
        phi: keyPair.phi.toString(),
        e: keyPair.e.toString(),
        d: keyPair.d.toString()
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function encryptMessage(req, res) {
  try {
    const message = String(req.body.message ?? '').trim();
    const publicKey = parsePublicKey(req.body.publicKey ?? req.body.key);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required' });
    }

    const encodedValues = encodeMessage(message, publicKey.n);
    const ciphertextValues = encodedValues.map(value => modPow(value, publicKey.e, publicKey.n));

    res.json({
      message,
      publicKey: { e: publicKey.e.toString(), n: publicKey.n.toString() },
      ciphertext: ciphertextValues.map(value => value.toString()).join(' '),
      encodedValues: encodedValues.map(value => value.toString()),
      ciphertextValues: ciphertextValues.map(value => value.toString())
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function decryptCiphertext(req, res) {
  try {
    const ciphertext = String(req.body.ciphertext ?? '').trim();
    const privateKey = parsePrivateKey(req.body.privateKey ?? req.body.key);

    if (!ciphertext) {
      return res.status(400).json({ error: 'Ciphertext is required' });
    }

    if (!privateKey) {
      return res.status(400).json({ error: 'Private key is required' });
    }

    const parts = ciphertext.split(/\s+/).filter(Boolean).map(part => toBigInt(part));
    const decodedValues = parts.map(value => modPow(value, privateKey.d, privateKey.n));
    const plaintext = decodedValues.map(value => String.fromCodePoint(Number(value))).join('');

    res.json({
      ciphertext,
      privateKey: { d: privateKey.d.toString(), n: privateKey.n.toString() },
      plaintext,
      decodedValues: decodedValues.map(value => value.toString())
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  generateKeys,
  encryptMessage,
  decryptCiphertext
};
