const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').optional().isMobilePhone('en-IN').withMessage('Valid Indian mobile number required'),
  body('state').notEmpty().withMessage('State is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('village').notEmpty().withMessage('Village is required'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 20, max: 2000 }),
  body('category').notEmpty().withMessage('Category is required')
    .isIn(['Water Supply', 'Electricity', 'Drainage', 'Road Damage', 'Garbage', 'Street Light', 'Public Property', 'Education', 'Health', 'Other']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
];

module.exports = { validate, registerValidation, loginValidation, complaintValidation };
