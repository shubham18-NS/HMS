import asyncHandler from 'express-async-handler';
import { Invoice } from '../models/Invoice.js';
import { ApiError } from '../utils/ApiError.js';

export const getInvoices = asyncHandler(async (req, res) => {
  const { status, patientId } = req.query;
  const query = {};
  if (status) query.status = status;
  if (patientId) query.patient = patientId;

  const invoices = await Invoice.find(query).populate('patient').populate('appointment').sort({ createdAt: -1 });
  res.json(invoices);
});

export const createInvoice = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, items = [], amount, dueDate, notes } = req.body;
  const invoice = await Invoice.create({
    patient: patientId,
    appointment: appointmentId,
    items,
    amount,
    dueDate,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json(invoice);
});

export const markInvoicePaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  invoice.status = 'paid';
  invoice.paymentMethod = req.body.paymentMethod || invoice.paymentMethod;
  invoice.paidAt = new Date();
  await invoice.save();

  res.json(invoice);
});
