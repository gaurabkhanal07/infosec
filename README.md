# Cryptography Web Application

A single-page Express app for learning three core cryptography concepts:

- Rail Fence Cipher encryption and decryption
- RSA key generation, encryption, and decryption with visible math steps
- Login and password verification using SHA-256 or MD5 hashing

## Features

- Responsive Bootstrap UI
- Dark/light mode toggle
- Copy buttons for ciphertext and keys
- Rail Fence matrix visualization
- RSA educational output for p, q, n, phi(n), e, and d
- Password strength meter
- Toast notifications

## Tech Stack

- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express.js
- Storage: Local file-backed user store in `database/users.json`
- Hashing: Node `crypto` module

## Routes

### Rail Fence Cipher

- `POST /railfence/encrypt`
- `POST /railfence/decrypt`

### RSA

- `POST /rsa/generate`
- `POST /rsa/encrypt`
- `POST /rsa/decrypt`

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify`

## Run It

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open:

```text
http://localhost:3000
```

## Notes

- Passwords are never stored in plaintext.
- The user store is local and file-backed so the app works without a separate database server.
- If you want MySQL or PostgreSQL later, the `database/db.js` layer is the place to swap.

## Example Hash Format

Stored values look like this:

```text
sha256$8dfcb0...
```

or

```text
md5$5f4dcc3b5aa765d61d8327deb882cf99
```
