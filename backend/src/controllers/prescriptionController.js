import asyncHandler from 'express-async-handler';
import { Prescription } from '../models/Prescription.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../utils/ApiError.js';

export const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentId, diagnosis, instructions, medications = [], attachments = [] } = req.body;
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const prescription = await Prescription.create({
    patient: patient._id,
    doctor: doctorId,
    appointment: appointmentId,
    diagnosis,
    instructions,
    medications,
    attachments,
  });

  patient.prescriptions.push(prescription._id);
  await patient.save();

  res.status(201).json(prescription);
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.params.patientId })
    .populate('doctor')
    .populate('appointment')
    .sort({ createdAt: -1 });
  res.json(prescriptions);
});
