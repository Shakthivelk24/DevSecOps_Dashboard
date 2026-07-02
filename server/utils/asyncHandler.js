// server/utils/asyncHandler.js
// Wraps async route handlers to catch errors and pass them
// to Express's next() — eliminating repetitive try/catch blocks.
//
// Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;