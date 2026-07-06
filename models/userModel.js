const database = require('../database/db');

function findByUsername(username) {
  const normalizedUsername = String(username ?? '').trim();
  if (!normalizedUsername) {
    return null;
  }

  return database.findUserByUsername(normalizedUsername);
}

function create(user) {
  return database.createUser(user);
}

function getAll() {
  return database.getAllUsers();
}

module.exports = {
  findByUsername,
  create,
  getAll
};
