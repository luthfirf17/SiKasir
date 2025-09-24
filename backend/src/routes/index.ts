import { Router } from 'express';
import authRoutes from './auth';
import waiterRoutes from './waiterRoutes';
import kasirRoutes from './kasirRoutes';
import customerRoutes from './customerRoutes';
import ownerRoutes from './ownerRoutes';
import menuRoutes from './menuRoutes';
import uploadRoutes from './uploadRoutes';
import { tableRoutes } from './tableRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/waiter', waiterRoutes);
router.use('/kasir', kasirRoutes);
router.use('/customer', customerRoutes);
router.use('/owner', ownerRoutes);
router.use('/menus', menuRoutes);
router.use('/upload', uploadRoutes);
router.use('/tables', tableRoutes);

export default router;
