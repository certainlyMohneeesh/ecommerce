import  { Request, Response, Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { Cart, ICart } from '../models/cartModel';
import { Order } from '../models/OrderModel';
import { User } from '../models/user';
import { Product } from '../models/product';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

interface UpdateQuantityRequest {
  userId: string;
  productId: string;
  productQty: number;
}


interface PlaceOrderRequest {
  userId: string;
  date: string;
  time: string;
  address: string;
  price: number;
  productsOrdered: Array<{ productId: string }>;
}

interface GetCartRequest {
  userId: string;
}

interface UpdateQuantityRequest {
  userId: string;
  productId: string;
  productQty: number;
}

interface CartProduct {
  productId: string;
  productQty: number;
}

interface DeleteItemRequest {
  userId: string;
  productId: string;
}

interface Product {
  productId: string;
  name: string;
  price: number;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Add to Cart
router.post('/addtocart', async (req: Request<{}, {}, AddToCartRequest>, res: Response) => {
  try {
    const { userId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId });
    const productQty = Number(quantity);

    if (cart) {
      cart.productsInCart.push({ productId, productQty });
      await cart.save();
    } else {
      cart = new Cart({ userId, productsInCart: [{ productId, quantity }] });
      await cart.save();
    }

    res.status(200).json({ success: true, message: 'Product added to cart successfully', cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error adding product to cart', error: error.message });
  }
});

// Get Cart
router.post('/get-cart', 
 async (req: Request<{}, {}, GetCartRequest>, res: Response) => {
    const { userId } = req.body;
    Cart.findOne({ userId })
      .then((cart: ICart | null) => {
        if (!cart) {
          return res.status(404).json({
            success: false,
            message: 'Cart not found for this user'
          });
        }
        res.status(200).json({
          success: true,
          cart
        });
      })
      .catch((error: Error) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching cart',
          error: error.message
        });
      });
  }
);

// Update Quantity
const updateQuantityHandler: RequestHandler<
  ParamsDictionary,
  any,
  UpdateQuantityRequest
> = async (req, res) => {
  const { userId, productId, productQty } = req.body;

  if (!userId || !productId || typeof productQty !== 'number') {
    res.status(400).json({ 
      message: 'userId, productId, and a valid productQty are required.' 
    });
    return;
  }

  try {
    const cart = await Cart.findOne({ userId }).exec();

    if (!cart) {
      res.status(404).json({ 
        message: 'Cart not found.' 
      });
      return;
    }

    
    const product = cart.productsInCart.find((item: CartProduct) => item.productId === productId);

    if (!product) {
      res.status(404).json({ 
        message: 'Product not found in the cart.' 
      });
      return;
    }

    product.productQty = productQty;
    await cart.save();

    res.status(200).json({ 
      message: 'Quantity updated successfully.' 
    });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ 
      message: 'An error occurred while updating the quantity.' 
    });
  }
};

router.put('/update-quantity', updateQuantityHandler);

// Delete Item from Cart
const deleteItemHandler: RequestHandler<
  ParamsDictionary,
  any,
  DeleteItemRequest
> = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    res.status(400).json({ 
      message: 'userId and productId are required.' 
    });
    return;
  }

  try {
    const result = await Cart.updateOne(
      { userId },
      { $pull: { productsInCart: { productId } } }
    ).exec();

    if (result.modifiedCount > 0) {
      res.status(200).json({ 
        message: 'Item deleted successfully.' 
      });
    } else {
      res.status(404).json({ 
        message: 'Item not found in the cart.' 
      });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      message: 'An error occurred while deleting the item.' 
    });
  }
};

router.post('/delete-items', deleteItemHandler);

// Place Order
const placeOrderHandler: RequestHandler<
  ParamsDictionary,
  any,
  PlaceOrderRequest
> = async (req, res) => {
  try {
    const { userId, date, time, address, price, productsOrdered } = req.body;

    const orderId = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingId = Math.random().toString(36).substring(2, 14).toUpperCase();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const productIds = productsOrdered.map(item => item.productId);
    const productDetails = await Product.find({ productId: { $in: productIds } });

    const orderWithProducts = new Order({
      userId,
      orderId,
      date,
      time,
      address,
      email: user.email,
      name: user.name,
      products: productDetails.map(product => ({
        productId: product.productId,
        name: product.name,
        price: Number(product.price)
      })),
      trackingId,
      price
    });

    await orderWithProducts.save();

    const emailHtml = `
      <div>
        <h2>Order Confirmation for ${user.name}</h2>
        <p>Order ID: ${orderId}</p>
        <p>Tracking ID: ${trackingId}</p>
        <h3>Products Ordered:</h3>
        <ul>
          ${productDetails.map(product =>
            `<li>${product.name} - $${product.price}</li>`
          ).join('')}
        </ul>
        <p>Total Price: $${price}</p>
      </div>
    `;

    await transporter.sendMail({
      from: 'pecommerce8@gmail.com',
      to: user.email,
      subject: 'Order Confirmation',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      trackingId
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
};

router.post('/place-order', placeOrderHandler);

export default router;
