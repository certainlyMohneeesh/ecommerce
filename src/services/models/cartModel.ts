import mongoose, { Document, Schema } from 'mongoose';

interface IProductInCart {
  productId: string;
  productQty: number;
}

export interface ICart extends Document {
  userId: string;
  productsInCart: IProductInCart[];
}

const cartSchema = new Schema<ICart>({
  userId: { type: String, required: true },
  productsInCart: [{
    productId: { type: String, required: true },
    productQty: { type: Number, required: true }
  }]
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
