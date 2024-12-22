import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: string;
  img: string;
  category: string;
  rating: number;
  productId: string;
  inStockValue: number;
  soldStockValue: number;
  visibility: string;
}

const productSchema = new Schema<IProduct>({
  name: { type: String },
  price: { type: String },
  img: { type: String },
  category: { type: String },
  rating: { type: Number },
  productId: { type: String, unique: true },
  inStockValue: { type: Number },
  soldStockValue: { type: Number },
  visibility: { type: String, default: 'on' }
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
