import asyncHandler from 'express-async-handler';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { Invoice } from '../models/Invoice.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [patients, doctors, appointments, invoices, appointmentStatusBreakdown, invoiceStatusBreakdown] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Invoice.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]),
    Invoice.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]),
  ]);

  const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).populate('patient doctor');
  const monthlyAppointments = await Appointment.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    totals: { patients, doctors, appointments, invoices },
    appointmentStatusBreakdown,
    invoiceStatusBreakdown,
    recentAppointments,
    monthlyAppointments,
  });
});
