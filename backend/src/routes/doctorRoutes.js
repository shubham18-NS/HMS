import { Router } from 'express';
import {
  assignPatient,
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateAvailability,
  updateDoctor,
} from '../controllers/doctorController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getDoctors);
router.post('/', authorize('admin'), createDoctor);
router.get('/:id', getDoctorById);
router.put('/:id', authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);
router.patch('/:id/availability', authorize('admin', 'doctor'), updateAvailability);
router.patch('/:id/assign-patient', authorize('admin', 'doctor'), assignPatient);

export default router;
