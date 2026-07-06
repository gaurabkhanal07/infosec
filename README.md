# Cryptography Web Application

A cryptography learning app that now supports Netlify deployment with static frontend pages, Netlify Functions, and blob-backed user storage.

The app teaches three core cryptography concepts:

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
- Backend for local dev: Node.js, Express.js
- Backend for Netlify: Netlify Functions
- Storage for local dev: Local file-backed user store in `database/users.json`
- Storage for Netlify: Netlify Blobs
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

## Netlify Deployment

1. Push the repo to GitHub.
2. Create a new site in Netlify and connect the repo.
3. Use these settings:

```text
Build command: npm install
Publish directory: public
Functions directory: netlify/functions
```

4. Deploy the site.

The frontend calls `/api/...` routes. In Netlify, these are rewritten to Functions.

## Netlify Notes

- Rail Fence and RSA run as serverless functions.
- Login uses Netlify Blobs, so user data persists across deploys.
- The existing Express app is still available for local development.

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
