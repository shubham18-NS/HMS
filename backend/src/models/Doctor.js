import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    specificDate: String,
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDuration: { type: Number, default: 30 },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true },
    department: String,
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    bio: String,
    availability: [availabilitySchema],
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
