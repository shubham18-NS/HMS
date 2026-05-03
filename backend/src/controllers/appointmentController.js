import asyncHandler from 'express-async-handler';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../utils/ApiError.js';
import { generateSlots } from '../utils/slotGenerator.js';
import { sendMail } from '../config/mailer.js';

const populateOptions = [
  { path: 'patient', populate: { path: 'user', select: 'name email phone' } },
  { path: 'doctor', populate: { path: 'user', select: 'name email phone' } },
  { path: 'createdBy', select: 'name email role' },
  { path: 'approvedBy', select: 'name email role' },
];

const getDateKey = (dateValue) => new Date(dateValue).toISOString().slice(0, 10);
const isAvailabilityMatch = (availability, dayOfWeek, dateKey) =>
  availability.specificDate ? availability.specificDate === dateKey : availability.dayOfWeek === dayOfWeek;

export const getAppointments = asyncHandler(async (req, res) => {
  const { status, doctorId, patientId } = req.query;
  const query = {};
  if (status) query.status = status;
  if (doctorId) query.doctor = doctorId;
  if (patientId) query.patient = patientId;

  const appointments = await Appointment.find(query).populate(populateOptions).sort({ date: -1, createdAt: -1 });
  res.json(appointments);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, timeSlot, reason, mode, notes } = req.body;
  const patient = await Patient.findById(patientId);
  const doctor = await Doctor.findById(doctorId);

  if (!patient || !doctor) {
    throw new ApiError(404, 'Patient or doctor not found');
  }

  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.getDay();
  const appointmentDateKey = getDateKey(appointmentDate);
  const availability = doctor.availability.filter((item) => isAvailabilityMatch(item, dayOfWeek, appointmentDateKey));

  if (!availability.length) {
    throw new ApiError(400, 'Doctor is not available on the selected date');
  }

  const generatedSlots = generateSlots(
    availability.map((item) => ({
      date: appointmentDateKey,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
    await Appointment.find({ doctor: doctorId, date: appointmentDate }),
    availability[0]?.slotDuration || 30
  );

  const selectedSlot = generatedSlots.find((slot) => slot.startTime === timeSlot.start && slot.endTime === timeSlot.end);
  if (!selectedSlot) {
    throw new ApiError(400, 'Selected slot is not available');
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    date: appointmentDate,
    timeSlot,
    reason,
    mode,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json(await Appointment.findById(appointment._id).populate(populateOptions));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id).populate(populateOptions);

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  appointment.status = status;
  appointment.approvedBy = req.user._id;
  await appointment.save();

  const patientEmail = appointment.patient?.user?.email;
  if (patientEmail) {
    try {
      await sendMail({
        to: patientEmail,
        subject: `Appointment ${status}`,
        html: `<p>Your appointment on ${appointment.date.toISOString().slice(0, 10)} is now <strong>${status}</strong>.</p>`,
      });
    } catch (error) {
      console.warn('Appointment status updated, but notification email failed:', error.message);
    }
  }

  res.json(await Appointment.findById(appointment._id).populate(populateOptions));
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  appointment.date = req.body.date || appointment.date;
  appointment.timeSlot = req.body.timeSlot || appointment.timeSlot;
  appointment.status = 'pending';
  await appointment.save();
  res.json(await Appointment.findById(appointment._id).populate(populateOptions));
});

export const availableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const doctor = await Doctor.findById(req.params.doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const requestedDate = new Date(date);
  const dayOfWeek = requestedDate.getDay();
  const requestedDateKey = getDateKey(requestedDate);
  const availability = doctor.availability.filter((item) => isAvailabilityMatch(item, dayOfWeek, requestedDateKey));
  const existingAppointments = await Appointment.find({ doctor: doctor._id, date: new Date(date) });
  const slots = generateSlots(
    availability.map((item) => ({
      date: requestedDateKey,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
    existingAppointments,
    availability[0]?.slotDuration || 30
  );

  res.json({ slots });
});
