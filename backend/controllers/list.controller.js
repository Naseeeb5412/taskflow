import { validationResult } from 'express-validator';
import List from '../models/List.model.js';
import Task from '../models/Task.model.js';
import Board from '../models/Board.model.js';

const verifyBoardOwner = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  return board;
};

export const getLists = async (req, res, next) => {
  try {
    const board = await verifyBoardOwner(req.params.boardId, req.user._id);
    if (!board) return res.status(404).json({ message: 'Board not found.' });

    const lists = await List.find({ board: req.params.boardId }).sort({ order: 1 });
    res.json(lists);
  } catch (err) {
    next(err);
  }
};

export const createList = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const board = await verifyBoardOwner(req.params.boardId, req.user._id);
    if (!board) return res.status(404).json({ message: 'Board not found.' });

    const lastList = await List.findOne({ board: req.params.boardId }).sort({ order: -1 });
    const order = lastList ? lastList.order + 1 : 0;

    const list = await List.create({
      title: req.body.title,
      board: req.params.boardId,
      order,
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id).populate('board');
    if (!list) return res.status(404).json({ message: 'List not found.' });

    if (list.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const updated = await List.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id).populate('board');
    if (!list) return res.status(404).json({ message: 'List not found.' });

    if (list.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Task.deleteMany({ list: list._id });
    await List.findByIdAndDelete(req.params.id);

    res.json({ message: 'List deleted.' });
  } catch (err) {
    next(err);
  }
};

export const reorderLists = async (req, res, next) => {
  try {
   
    const { lists } = req.body;
    const updates = lists.map(({ _id, order }) =>
      List.findByIdAndUpdate(_id, { order }, { new: true })
    );
    await Promise.all(updates);
    res.json({ message: 'Lists reordered.' });
  } catch (err) {
    next(err);
  }
};
