import { Router } from 'express';
import authController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Auth routes
router.post('/login', (req, res, next) => {
  console.log('🔀 AUTH ROUTE: Login request received');
  console.log('🔀 Route headers:', {
    'origin': req.headers.origin,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });
  next();
}, authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// TEMPORARY - ONLY FOR DEVELOPMENT
router.post('/reset-admin-password', authController.resetAdminPassword);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);

export default router;
