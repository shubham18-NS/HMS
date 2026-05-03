import { Router } from 'express';
import { createInvoice, getInvoices, markInvoicePaid } from '../controllers/invoiceController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', authorize('admin', 'doctor'), getInvoices);
router.post('/', authorize('admin'), createInvoice);
router.patch('/:id/pay', authorize('admin'), markInvoicePaid);

export default router;
