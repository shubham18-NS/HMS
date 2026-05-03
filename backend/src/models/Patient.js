import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const visitSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    notes: String,
    diagnosis: String,
    treatment: String,
    treatmentDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: String,
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    medicalHistory: [String],
    prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    reports: [reportSchema],
    visits: [visitSchema],
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    notes: String,
  },
  { timestamps: true }
);

export const Patient = mongoose.model('Patient', patientSchema);
