import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  orderId: string;
  date: string;
  time: string;
  address: string;
  email: string;
  name: string;
  productIds: string[];
  trackingId: string;
  price: number;
}

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  productIds: [{ type: String, required: true }],
  trackingId: { type: String, required: true },
  price: { type: Number, required: true }
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
