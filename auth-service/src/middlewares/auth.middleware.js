import passport from 'passport';

// Middleware to protect routes using Passport JWT strategy
export const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    req.user = user; // Attach user to req.user
    next();
  })(req, res, next);
};