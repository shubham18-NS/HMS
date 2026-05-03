import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';

const buildUserProfile = async (user) => {
  const base = { user };

  if (user.role === 'patient') {
    base.profile = await Patient.findOne({ user: user._id }).populate('assignedDoctor');
  }

  if (user.role === 'doctor') {
    base.profile = await Doctor.findOne({ user: user._id }).populate('patients');
  }

  return base;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'patient', patientProfile = {}, doctorProfile = {} } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({ name, email, password, phone, role });

  if (role === 'patient') {
    await Patient.create({
      user: user._id,
      dateOfBirth: patientProfile.dateOfBirth,
      gender: patientProfile.gender,
      bloodGroup: patientProfile.bloodGroup,
      address: patientProfile.address,
      emergencyContact: patientProfile.emergencyContact,
      medicalHistory: patientProfile.medicalHistory || [],
      notes: patientProfile.notes,
    });
  }

  if (role === 'doctor') {
    await Doctor.create({
      user: user._id,
      specialization: doctorProfile.specialization || 'General Medicine',
      department: doctorProfile.department,
      experienceYears: doctorProfile.experienceYears || 0,
      consultationFee: doctorProfile.consultationFee || 0,
      bio: doctorProfile.bio,
      availability: doctorProfile.availability || [],
    });
  }

  const token = generateToken({ id: user._id, role: user.role });
  res.status(201).json({
    message: 'User registered successfully',
    token,
    ...(await buildUserProfile(user)),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });
  const userWithoutPassword = await User.findById(user._id);

  res.json({
    message: 'Login successful',
    token,
    ...(await buildUserProfile(userWithoutPassword)),
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json(await buildUserProfile(req.user));
});
