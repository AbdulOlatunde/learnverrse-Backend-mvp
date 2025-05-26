import express from 'express';
import { getUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/auth/user - Fetch authenticated user data
// Requires: Authorization: Bearer <access-token>
// Success: { success: true, message, data: { id, name, email, accessToken? } }
// Errors: { success: false, message }
router.get('/user', protect, getUser);

export default router;