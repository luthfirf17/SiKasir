import { Router } from 'express';
import { TableController } from '../controllers/TableController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();
const tableController = new TableController();

// Development-only debug route: update first table without auth for quick local testing
if (process.env.NODE_ENV !== 'production') {
	router.post('/__debug/update-first', async (req, res) => {
		try {
			const { capacity, area, table_number, status, location } = req.body || {};
			const tableRepo = (await import('../config/database')).AppDataSource.getRepository((await import('../models/Table')).Table);

			const first = await tableRepo.createQueryBuilder('t').orderBy('t.table_number', 'ASC').getOne();
			if (!first) return res.status(404).json({ message: 'No tables found to update' });

			const updates: any = {};
			if (capacity !== undefined) updates.capacity = Number(capacity);
			if (table_number !== undefined) updates.table_number = table_number;
			if (status !== undefined) updates.status = status;
			// accept semantic `area` and map to persisted `location`
			if (area !== undefined && location === undefined) updates.location = area;
			if (location !== undefined) updates.location = location;

			if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields provided' });

			await tableRepo.update(first.id, updates);
			const updated = await tableRepo.findOne({ where: { id: first.id } });
			return res.json({ message: 'Debug update applied', data: updated });
		} catch (err) {
			console.error('Debug update failed:', err);
			return res.status(500).json({ message: 'Debug update failed' });
		}
	});
}

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Table CRUD operations
router.get('/', tableController.getAllTables);
router.get('/stats', tableController.getTableStats);
router.get('/dashboard', tableController.getTablesDashboard);
router.get('/:id', tableController.getTableById);
router.get('/:id/qr-code', tableController.getTableQRCode);
router.get('/:id/usage-history', tableController.getTableUsageHistory);

// Admin only routes
router.post('/', roleMiddleware(['admin', 'owner']), tableController.createTable);
router.put('/:id', roleMiddleware(['admin', 'owner']), tableController.updateTable);
router.delete('/:id', roleMiddleware(['admin', 'owner']), tableController.deleteTable);

// Status updates (admin, kasir, waiter can update)
router.patch('/:id/status', roleMiddleware(['admin', 'owner', 'kasir', 'waiter']), tableController.updateTableStatus);

export { router as tableRoutes };

// Development-only debug route: update first table without auth for quick local testing
if (process.env.NODE_ENV !== 'production') {
	router.post('/__debug/update-first', async (req, res) => {
		try {
			const { capacity, area, table_number, status, location } = req.body || {};
			const tableRepo = (await import('../config/database')).AppDataSource.getRepository((await import('../models/Table')).Table);

			const first = await tableRepo.createQueryBuilder('t').orderBy('t.table_number', 'ASC').getOne();
			if (!first) return res.status(404).json({ message: 'No tables found to update' });

			const updates: any = {};
			if (capacity !== undefined) updates.capacity = Number(capacity);
			if (table_number !== undefined) updates.table_number = table_number;
			if (status !== undefined) updates.status = status;
			// accept semantic `area` and map to persisted `location`
			if (area !== undefined && location === undefined) updates.location = area;
			if (location !== undefined) updates.location = location;

			if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields provided' });

			await tableRepo.update(first.id, updates);
			const updated = await tableRepo.findOne({ where: { id: first.id } });
			return res.json({ message: 'Debug update applied', data: updated });
		} catch (err) {
			console.error('Debug update failed:', err);
			return res.status(500).json({ message: 'Debug update failed' });
		}
	});
}
