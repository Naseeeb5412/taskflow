import { validationResult } from 'express-validator';
import Board from '../models/Board.model.js';
import List from '../models/List.model.js';
import Task from '../models/Task.model.js';

export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) return res.status(404).json({ message: 'Board not found.' });
    res.json(board);
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, color } = req.body;
    const board = await Board.create({ title, description, color, owner: req.user._id });
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!board) return res.status(404).json({ message: 'Board not found.' });
    res.json(board);
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!board) return res.status(404).json({ message: 'Board not found.' });

  
    const lists = await List.find({ board: board._id });
    const listIds = lists.map((l) => l._id);
    await Task.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: board._id });

    res.json({ message: 'Board deleted.' });
  } catch (err) {
    next(err);
  }
};
