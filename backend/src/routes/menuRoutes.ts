import { Router } from 'express';
import { MenuController } from '../controllers/MenuController';

const router = Router();
const menuController = new MenuController();

// Menu CRUD operations
router.get('/', menuController.getAllMenus);
router.get('/stats', menuController.getMenuStats);
router.get('/:id', menuController.getMenuById);
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);
router.patch('/:id/toggle-availability', menuController.toggleAvailability);

// Category operations
router.get('/categories/all', menuController.getCategories);
router.post('/categories', menuController.createCategory);
router.delete('/categories/:id', menuController.deleteCategory);

export default router;
