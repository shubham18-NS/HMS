import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: [invoiceItemSchema],
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paymentMethod: String,
    dueDate: Date,
    paidAt: Date,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
