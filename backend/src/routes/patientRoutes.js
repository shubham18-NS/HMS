import { Router } from 'express';
import {
  addVisit,
  assignDoctor,
  createPatient,
  deletePatient,
  getPatientById,
  getPatients,
  updatePatient,
  uploadReport,
} from '../controllers/patientController.js';
import { authorize, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect);
router.get('/', authorize('admin', 'doctor'), getPatients);
router.post('/', authorize('admin'), createPatient);
router.get('/:id', authorize('admin', 'doctor', 'patient'), getPatientById);
router.put('/:id', authorize('admin', 'patient', 'doctor'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);
router.patch('/:id/assign-doctor', authorize('admin', 'doctor'), assignDoctor);
router.post('/:id/visits', authorize('admin', 'doctor'), addVisit);
router.post('/:id/reports', authorize('admin', 'doctor', 'patient'), upload.single('file'), uploadReport);

export default router;
