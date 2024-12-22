import  { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import bcrypt from 'bcrypt';
import { Seller } from '../models/seller';

const router = Router();

// Extend Express Request to include session
declare module 'express-serve-static-core' {
  interface Request {
    session: any;
  }
}

interface LoginRequest {
  sellerId: string;
  emailOrPhone: string;
  password: string;
}

interface SignupRequest {
  phoneNumber: string;
  emailId: string;
  password: string;
}

interface VerifySellerRequest {
  sellerId: string;
}

interface LogoutRequest {
  sellerId: string;
}

// Seller Login
const loginHandler: RequestHandler<
  ParamsDictionary,
  any,
  LoginRequest
> = async (req, res) => {
  try {
    const { sellerId, emailOrPhone, password } = req.body;

    if (!sellerId || !emailOrPhone || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'Seller ID, email/phone, and password are required'
      });
      return;
    }

    const seller = await Seller.findOne({
      sellerId,
      $or: [
        { email: emailOrPhone },
        { phoneNumber: emailOrPhone }
      ]
    }).exec();

    if (!seller) {
      res.status(400).json({
        error: 'Invalid credentials',
        details: 'No seller found with provided ID and email/phone'
      });
      return;
    }

    if (!seller.emailVerified && !seller.phoneVerified) {
      res.status(401).json({
        error: 'Account not verified',
        details: 'Please verify your email or phone number before logging in'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      res.status(400).json({
        error: 'Invalid credentials',
        details: 'Incorrect password provided'
      });
      return;
    }

    seller.loggedIn = 'loggedin';
    await seller.save();

    req.session.sellerId = sellerId;
    res.status(200).json({
      success: true,
      message: 'Login successful',
      sellerId,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Error logging in',
      details: error.message
    });
  }
};

// Register the route
router.post('/login', loginHandler);

// Seller Signup
const signupHandler: RequestHandler<
  ParamsDictionary,
  any,
  SignupRequest
> = async (req, res) => {
  try {
    const { phoneNumber, emailId, password } = req.body;

    const existingSeller = await Seller.findOne({ email: emailId }).exec();
    if (existingSeller) {
      res.status(400).json({ error: 'Seller already exists' });
      return;
    }

    // Initialize sellerId with a default value
    const sellerId = await generateUniqueSellerId();

    const seller = new Seller({
      name: 'Not Available',
      email: emailId,
      password: password,
      sellerId: sellerId,
      emailVerified: false,
      phoneVerified: false,
      phoneNumber: phoneNumber,
      businessName: 'Not Available',
      businessAddress: 'Not Available',
      businessType: 'Not Available'
    });

    await seller.save();
    req.session.sellerId = sellerId;

    res.status(201).json({
      message: 'Seller registered successfully',
      sellerId
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Error registering seller',
      message: error.message
    });
  }
};

// Helper function to generate unique seller ID
async function generateUniqueSellerId(): Promise<string> {
  let sellerId = '';  // Initialize with empty string
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    sellerId = `MBSLR${randomNum}`;
    const existingId = await Seller.findOne({ sellerId }).exec();
    if (!existingId) isUnique = true;
  }

  return sellerId;
}

router.post('/seller/signup', signupHandler);

// Verify Seller
const verifySellerHandler: RequestHandler<
  ParamsDictionary,
  any,
  VerifySellerRequest
> = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
      return;
    }

    const seller = await Seller.findOne({ sellerId }).exec();

    if (!seller) {
      res.status(404).json({
        success: false,
        message: 'Invalid seller ID'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Valid seller ID',
      loggedIn: seller.loggedIn
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying seller ID',
      error: error.message
    });
  }
};

router.post('/verify-seller', verifySellerHandler);

// Logout
const logoutHandler: RequestHandler<
  ParamsDictionary,
  any,
  LogoutRequest
> = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      res.status(400).json({
        error: 'Seller ID is required'
      });
      return;
    }

    const seller = await Seller.findOne({ sellerId }).exec();
   
    if (!seller) {
      res.status(404).json({
        error: 'Seller not found'
      });
      return;
    }

    seller.loggedIn = 'loggedout';
    await seller.save();

    req.session.destroy((err: Error | null) => {
      if (err) {
        res.status(500).json({ error: 'Error logging out' });
        return;
      }
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Seller logged out successfully',
        loggedIn: 'loggedout'
      });
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Error logging out',
      details: error.message
    });
  }
};

router.post('/logout', logoutHandler);

export default router;
