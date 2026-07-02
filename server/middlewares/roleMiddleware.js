// server/middleware/roleMiddleware.js
// Role-Based Access Control middleware.
// Use after protect middleware: router.delete('/', protect, restrictTo('admin'), handler)

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};