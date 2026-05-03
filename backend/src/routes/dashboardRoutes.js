import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/summary', getDashboardSummary);

export default router;
