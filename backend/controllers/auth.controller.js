import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.model.js';

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: '7d',
  });

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  // Token is stored client-side; just acknowledge
  res.json({ message: 'Logged out successfully.' });
};

export const getMe = async (req, res) => {
  res.json({
    user: { _id: req.user._id, name: req.user.name, email: req.user.email },
  });
};
