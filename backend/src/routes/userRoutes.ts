import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authMiddleware);

// Get all users with pagination and filtering
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Change user password
router.patch('/:id/password', userController.changePassword);

export default router;