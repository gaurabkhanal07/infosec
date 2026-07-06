const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'users.json');
const initialState = { nextId: 1, users: [] };

function ensureStore() {
  if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(initialState, null, 2), 'utf8');
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return {
      nextId: Number.isInteger(parsed.nextId) ? parsed.nextId : 1,
      users: Array.isArray(parsed.users) ? parsed.users : []
    };
  } catch (error) {
    return { ...initialState };
  }
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function findUserByUsername(username) {
  const store = readStore();
  return store.users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
}

function createUser(user) {
  const store = readStore();
  const record = {
    id: store.nextId,
    username: String(user.username).trim(),
    password_hash: String(user.password_hash)
  };

  store.nextId += 1;
  store.users.push(record);
  writeStore(store);
  return record;
}

function getAllUsers() {
  const store = readStore();
  return store.users;
}

module.exports = {
  findUserByUsername,
  createUser,
  getAllUsers
};
