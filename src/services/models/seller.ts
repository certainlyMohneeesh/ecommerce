import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ISeller extends Document {
  name: string;
  email: string;
  password: string;
  sellerId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneNumber: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
  otp?: string;
  loggedIn: 'loggedin' | 'loggedout';
}

const SellerSchema = new Schema<ISeller>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  sellerId: { type: String, unique: true, required: true },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  phoneNumber: { type: String, required: true },
  businessName: { type: String, required: true },
  businessAddress: { type: String, required: true },
  businessType: { type: String, required: true },
  otp: { type: String },
  loggedIn: { type: String, enum: ['loggedin', 'loggedout'], default: 'loggedout' }
});

// Hash password before saving
SellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const Seller = mongoose.model<ISeller>('Seller', SellerSchema);
