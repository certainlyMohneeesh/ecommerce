import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  complaintNumber: string;
  name: string;
  email: string;
  message: string;
  userType: string;
  status: string;
  createdAt: Date;
}

const complaintsSchema = new Schema<IComplaint>({
  complaintNumber: { type: String },
  name: { type: String },
  email: { type: String },
  message: { type: String },
  userType: { type: String },
  status: {
    type: String,
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintsSchema);
