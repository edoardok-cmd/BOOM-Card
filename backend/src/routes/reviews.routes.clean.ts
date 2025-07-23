import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.middleware.clean';

const router = Router();

// Validation error handler
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Get user's reviews
router.get('/my-reviews', authenticateToken, (req: any, res: any) => {
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      partnerId: 'sofia-grand',
      partnerName: 'The Sofia Grand',
      rating: 5,
      content: 'Excellent service and amazing food. The BOOM Card discount made it even better!',
      date: '2024-01-15T10:30:00Z',
      helpful: 12
    },
    {
      id: 2,
      partnerId: 'coffee-central',
      partnerName: 'Coffee Central',
      rating: 4,
      content: 'Great coffee and cozy atmosphere. Good discount with BOOM Card.',
      date: '2024-01-10T14:20:00Z',
      helpful: 8
    }
  ];

  res.json({
    success: true,
    data: reviews
  });
});

// Submit a new review
const validateReview = [
  body('partnerId')
    .notEmpty()
    .withMessage('Partner ID is required'),
  body('partnerName')
    .notEmpty()
    .withMessage('Partner name is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review content must be between 10 and 1000 characters'),
];

router.post('/', 
  authenticateToken,
  validateReview,
  handleValidationErrors,
  (req: any, res: any) => {
    const { partnerId, partnerName, rating, content } = req.body;
    
    // Mock response - in real implementation, this would save to database
    const newReview = {
      id: Date.now(),
      partnerId,
      partnerName,
      rating,
      content,
      date: new Date().toISOString(),
      helpful: 0,
      userId: req.user.id
    };

    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review submitted successfully'
    });
  }
);

// Health check for reviews service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reviews service is healthy',
    timestamp: new Date().toISOString(),
    service: 'reviews'
  });
});

export default router;