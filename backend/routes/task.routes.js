import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  reorderTasks,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/board/:boardId', getTasks);
router.post(
  '/',
  [body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required.'),
   body('list').notEmpty().withMessage('List ID required.')],
  createTask
);
router.put('/reorder', reorderTasks);
router.put('/:id/move', moveTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
