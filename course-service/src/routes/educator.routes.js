import express from 'express';
import {
  updateCourse,
  deleteCourse,
} from '../controllers/educator.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:courseId', authMiddleware, updateCourse);
router.delete('/:courseId', authMiddleware, deleteCourse);

export default router;
