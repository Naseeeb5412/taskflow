import express from 'express';
import { body } from 'express-validator';
import {
  getLists,
  createList,
  updateList,
  deleteList,
  reorderLists,
} from '../controllers/list.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/board/:boardId', getLists);
router.post(
  '/board/:boardId',
  [body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required.')],
  createList
);
router.put('/reorder', reorderLists);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
