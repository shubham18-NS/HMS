import asyncHandler from 'express-async-handler';
import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../utils/ApiError.js';

const doctorPopulate = [
  { path: 'user', select: 'name email role phone avatar createdAt' },
  { path: 'patients', populate: { path: 'user', select: 'name email phone' } },
];

export const getDoctors = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const allDoctors = await Doctor.find().populate(doctorPopulate).sort({ createdAt: -1 });
  const filteredDoctors = search
    ? allDoctors.filter((doctor) => {
        const name = doctor.user?.name || '';
        const specialization = doctor.specialization || '';
        const department = doctor.department || '';
        return [name, specialization, department].some((value) => new RegExp(search, 'i').test(value));
      })
    : allDoctors;

  const total = filteredDoctors.length;
  const start = (Number(page) - 1) * Number(limit);
  const doctors = filteredDoctors.slice(start, start + Number(limit));

  res.json({ doctors, page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(doctorPopulate);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  res.json(doctor);
});

export const createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, ...doctorData } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({ name, email, password, phone, role: 'doctor' });
  const doctor = await Doctor.create({ user: user._id, ...doctorData });
  res.status(201).json(await Doctor.findById(doctor._id).populate(doctorPopulate));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (req.user.role === 'doctor' && doctor.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: you can only update your own profile');
  }

  const user = await User.findById(doctor.user);
  if (user && req.body.name) user.name = req.body.name;
  if (user && req.body.email) user.email = req.body.email;
  if (user && req.body.phone) user.phone = req.body.phone;
  if (req.body.password) user.password = req.body.password;
  if (user) await user.save();

  Object.assign(doctor, req.body);
  await doctor.save();
  res.json(await Doctor.findById(doctor._id).populate(doctorPopulate));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  await User.findByIdAndDelete(doctor.user);
  await doctor.deleteOne();
  res.json({ message: 'Doctor deleted successfully' });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (req.user.role === 'doctor' && doctor.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: you can only update your own availability');
  }

  doctor.availability = req.body.availability || doctor.availability;
  await doctor.save();
  res.json(await Doctor.findById(doctor._id).populate(doctorPopulate));
});

export const assignPatient = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  const patient = await Patient.findById(req.body.patientId);

  if (!doctor || !patient) {
    throw new ApiError(404, 'Doctor or patient not found');
  }

  if (!doctor.patients.some((id) => id.toString() === patient._id.toString())) {
    doctor.patients.push(patient._id);
  }

  patient.assignedDoctor = doctor._id;
  await Promise.all([doctor.save(), patient.save()]);
  res.json(await Doctor.findById(doctor._id).populate(doctorPopulate));
});
