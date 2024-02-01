const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const Dummy_Users = require('../Dummy-Users');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  res.json({ users: Dummy_Users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { name, email, password } = req.body;

  const hasUser = Dummy_Users.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError('Could not create user, email already exists.', 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  Dummy_Users.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = Dummy_Users.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      'Could not identify user, credentials seem to be wrong.',
      401
    );
  }

  res.json({ message: 'Logged in!' });
};

module.exports = {
  getUsers,
  signup,
  login,
};
