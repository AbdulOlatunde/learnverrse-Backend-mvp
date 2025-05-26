import { HTTPSTATUS } from '../configs/http.config.js';
import AsyncHandler from '../middlewares/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { getEnv } from '../utils/getenv.js';
import UserModel from '../models/user.model.js';
import argon2 from 'argon2';

// GET /api/auth/user
export const getUser = AsyncHandler(async (req, res) => {
  let user = req.user; // User from protect middleware
  let newAccessToken = null;

  // If no user (expired token), try refresh token
  if (!user) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    try {
      const payload = jwt.verify(refreshToken, getEnv('REFRESH_TOKEN_SECRET'));
      user = await UserModel.findById(payload.id).select('+refreshToken');
      if (!user || !user.refreshToken || !(await argon2.verify(user.refreshToken, refreshToken))) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new access token
      newAccessToken = jwt.sign({ id: user._id }, getEnv('JWT_SECRET'), { expiresIn: '15m' });
      // Update req.user for response
      req.user = await UserModel.findById(payload.id).select('-password -refreshToken');
    } catch (err) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      ...req.user.omitPassword(),
      ...(newAccessToken && { accessToken: newAccessToken }), // Include new token if refreshed
    },
  });
});