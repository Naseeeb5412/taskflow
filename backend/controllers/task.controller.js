import { validationResult } from 'express-validator';
import Task from '../models/Task.model.js';
import List from '../models/List.model.js';
import Board from '../models/Board.model.js';

const verifyListAccess = async (listId, userId) => {
  const list = await List.findById(listId).populate('board');
  if (!list) return null;
  if (list.board.owner.toString() !== userId.toString()) return null;
  return list;
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId }).sort({ list: 1, order: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const list = await verifyListAccess(req.body.list, req.user._id);
    if (!list) return res.status(404).json({ message: 'List not found.' });

    const lastTask = await Task.findOne({ list: req.body.list }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      ...req.body,
      board: list.board._id,
      order,
      activity: [{ action: 'Task created' }],
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate({ path: 'list', populate: 'board' });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.list.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const activityEntry = { action: `Task updated` };
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $push: { activity: activityEntry } },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const moveTask = async (req, res, next) => {
  try {
    const { listId, order } = req.body;
    const task = await Task.findById(req.params.id).populate({ path: 'list', populate: 'board' });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.list.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const targetList = await verifyListAccess(listId, req.user._id);
    if (!targetList) return res.status(404).json({ message: 'Target list not found.' });

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        list: listId,
        order,
        $push: { activity: { action: `Moved to ${targetList.title}` } },
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate({ path: 'list', populate: 'board' });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.list.board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    const updates = tasks.map(({ _id, order, list }) =>
      Task.findByIdAndUpdate(_id, { order, list }, { new: true })
    );
    await Promise.all(updates);
    res.json({ message: 'Tasks reordered.' });
  } catch (err) {
    next(err);
  }
};
