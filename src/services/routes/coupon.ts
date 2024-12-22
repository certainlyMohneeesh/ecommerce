import express, { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Coupon } from '../models/couponModel'; // Ensure correct type definitions for the Coupon model
import { User } from '../models/user'; // Ensure correct type definitions for the User model

dotenv.config();

const router: Router = express.Router();

interface CouponRequest {
  code: string;
  discountPercentage: number;
}

interface VerifyCouponRequest {
  code: string;
}

interface DeleteCouponRequest {
    code: string;
    discountPercentage: number;
  }

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmailToAllUsers(subject: string, message: string): Promise<void> {
  try {
    const users = await User.find({}, 'email').exec(); // Explicit `.exec()` for better type safety with Mongoose
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: 'pecommerce8@gmail.com',
          to: user.email,
          subject,
          text: message,
        });
      } catch (emailError) {
        console.error(`Error sending email to ${user.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Error fetching users or sending emails:', error);
  }
}

// Get all coupons
router.get('/get-coupon', async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().exec();
    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message,
    });
  }
});

// Save coupon
router.post('/save-coupon', async (req: Request<{}, {}, CouponRequest>, res: Response) => {
  try {
    const { code, discountPercentage } = req.body;
    const coupon = new Coupon({
      code,
      discountPercentage,
    });

    await coupon.save();
    res.status(201).json({
      success: true,
      message: 'Coupon saved successfully',
      coupon,
    });

    const subject = 'New Coupon Available!';
    const message = `A new coupon ${code} is now available with ${discountPercentage}% discount. Use it in your next purchase!`;
    await sendEmailToAllUsers(subject, message);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error saving coupon',
      error: error.message,
    });
  }
});

// Verify coupon
router.post(
    '/verify-coupon',
    async (
      req: Request<{}, {}, VerifyCouponRequest>,
      res: Response
    ) => {
      try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code }).exec();
  
        if (!coupon) {
          res.status(404).json({
            success: false,
            message: 'Invalid coupon code',
          });
          return;
        }
  
        res.status(200).json({
          success: true,
          discountPercentage: coupon.discountPercentage,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Error verifying coupon',
          error: error.message,
        });
      }
    }
  );
  
  // Delete coupon
  router.delete(
    '/delete-coupon',
    async (
      req: Request<{}, {}, DeleteCouponRequest>,
      res: Response
    ) => {
      try {
        const { code, discountPercentage } = req.body;
  
        const deletedCoupon = await Coupon.findOneAndDelete({
          code,
          discountPercentage,
        }).exec();
  
        if (!deletedCoupon) {
          res.status(404).json({
            success: false,
            message: 'Coupon not found',
          });
          return;
        }
  
        const subject = 'Coupon Expired';
        const message = `The coupon ${code} with ${discountPercentage}% discount has expired.`;
        await sendEmailToAllUsers(subject, message);
  
        res.status(200).json({
          success: true,
          message: 'Coupon deleted successfully',
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Error deleting coupon',
          error: error.message,
        });
      }
    }
  );
  

export default router;
