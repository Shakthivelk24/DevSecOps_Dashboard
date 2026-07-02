// server/middleware/validateMiddleware.js
// Lightweight request body validators.
// Returns 422 Unprocessable Entity if validation fails.

export const validatePipeline = (req, res, next) => {
  const { name, repository } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push({ field: 'name', message: 'Pipeline name must be at least 2 characters' });

  if (!repository || !repository.startsWith('http'))
    errors.push({ field: 'repository', message: 'Valid repository URL is required' });

  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};