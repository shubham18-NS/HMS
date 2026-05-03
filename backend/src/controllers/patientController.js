import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { ApiError } from '../utils/ApiError.js';

const patientPopulate = [
  { path: 'user', select: 'name email role phone avatar createdAt' },
  { path: 'assignedDoctor', populate: { path: 'user', select: 'name email phone' } },
  { path: 'prescriptions' },
];

export const getPatients = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const allPatients = await Patient.find().populate(patientPopulate).sort({ createdAt: -1 });
  const filteredPatients = search
    ? allPatients.filter((patient) => {
        const name = patient.user?.name || '';
        const email = patient.user?.email || '';
        const bloodGroup = patient.bloodGroup || '';
        return [name, email, bloodGroup].some((value) => new RegExp(search, 'i').test(value));
      })
    : allPatients;

  const total = filteredPatients.length;
  const start = (Number(page) - 1) * Number(limit);
  const patients = filteredPatients.slice(start, start + Number(limit));

  res.json({ patients, page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate(patientPopulate);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  res.json(patient);
});

export const createPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, ...patientData } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({ name, email, password, phone, role: 'patient' });
  const patient = await Patient.create({ user: user._id, ...patientData });
  res.status(201).json(await Patient.findById(patient._id).populate(patientPopulate));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const user = await User.findById(patient.user);
  if (user && req.body.name) user.name = req.body.name;
  if (user && req.body.email) user.email = req.body.email;
  if (user && req.body.phone) user.phone = req.body.phone;
  if (req.body.password) user.password = req.body.password;
  if (user) await user.save();

  Object.assign(patient, req.body);
  await patient.save();
  res.json(await Patient.findById(patient._id).populate(patientPopulate));
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  await User.findByIdAndDelete(patient.user);
  await patient.deleteOne();
  res.json({ message: 'Patient deleted successfully' });
});

export const assignDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.body;
  const patient = await Patient.findById(req.params.id);
  const doctor = await Doctor.findById(doctorId);

  if (!patient || !doctor) {
    throw new ApiError(404, 'Patient or doctor not found');
  }

  patient.assignedDoctor = doctor._id;
  if (!doctor.patients.some((id) => id.toString() === patient._id.toString())) {
    doctor.patients.push(patient._id);
  }

  await Promise.all([patient.save(), doctor.save()]);
  res.json(await Patient.findById(patient._id).populate(patientPopulate));
});

export const addVisit = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  patient.visits.push(req.body);
  await patient.save();
  res.status(201).json(patient);
});

export const uploadReport = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (!req.file) {
    throw new ApiError(400, 'Report file is required');
  }

  let uploaded = { secure_url: '' };
  if (cloudinary?.uploader && process.env.CLOUDINARY_CLOUD_NAME) {
    uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'hms/reports', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  }

  patient.reports.push({
    name: req.body.name || req.file.originalname,
    url: uploaded.secure_url || '',
    type: req.file.mimetype,
  });
  await patient.save();
  res.status(201).json(await Patient.findById(patient._id).populate(patientPopulate));
});
