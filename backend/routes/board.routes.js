import express from 'express';
import { body } from 'express-validator';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBoards);
router.get('/:id', getBoard);
router.post(
  '/',
  [body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required.')],
  createBoard
);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
