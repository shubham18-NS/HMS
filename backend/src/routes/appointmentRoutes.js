import { Router } from 'express';
import {
  availableSlots,
  createAppointment,
  getAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getAppointments);
router.post('/', authorize('admin', 'doctor', 'patient'), createAppointment);
router.get('/slots/:doctorId', availableSlots);
router.patch('/:id/status', authorize('admin', 'doctor'), updateAppointmentStatus);
router.patch('/:id/slot', authorize('admin', 'doctor', 'patient'), rescheduleAppointment);

export default router;
