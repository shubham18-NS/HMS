import { Router } from 'express';
import { createPrescription, getPatientPrescriptions } from '../controllers/prescriptionController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.post('/', authorize('admin', 'doctor'), createPrescription);
router.get('/patient/:patientId', authorize('admin', 'doctor', 'patient'), getPatientPrescriptions);

export default router;
