import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { User } from '../models/user';
import { Seller } from '../models/seller';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = Router();

// Declare session types
declare global {
  namespace Express {
    interface Session {
      userId?: string;
      sellerId?: string;
    }
  }
}

// Interface definitions
interface UserSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface UserLoginRequest {
  email: string;
  password: string;
}

interface SellerSignupRequest {
  phoneNumber: string;
  emailId: string;
  password: string;
  name: string;
  businessName: string;
  businessAddress: string;
  businessType: string;
}

interface SellerLoginRequest {
  sellerId: string;
  emailOrPhone: string;
  password: string;
}

// Helper functions
async function generateUniqueSellerId(): Promise<string> {
  let sellerId = '';
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    sellerId = `MBSLR${randomNum}`;
    const existingId = await Seller.findOne({ sellerId }).exec();
    if (!existingId) isUnique = true;
  }

  return sellerId;
}

// User Routes
const userSignupHandler: RequestHandler<
  ParamsDictionary,
  any,
  UserSignupRequest
> = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const userId = crypto.randomBytes(8).toString('hex');
    const user = new User({ name, email, password, userId, phone });
    await user.save();

    req.session.userId = user.userId;
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error: any) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

const userLoginHandler: RequestHandler<
  ParamsDictionary,
  any,
  UserLoginRequest
> = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ error: 'Account is suspended' });
      return;
    }

    if (user.accountStatus === 'blocked') {
      res.status(403).json({ error: 'Account is blocked' });
      return;
    }

    if (user.accountStatus === 'open') {
      req.session.userId = user.userId;
      res.status(200).json({ message: 'Login successful', userId: user.userId });
      return;
    }

    res.status(400).json({ error: 'Invalid account status' });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

const userLogoutHandler: RequestHandler = (req, res) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Error logging out' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

const getUserDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }, { name: 1, _id: 0 }).exec();
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({ name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching user details' });
  }
};

// Seller Routes
const sellerSignupHandler: RequestHandler<
  ParamsDictionary,
  any,
  SellerSignupRequest
> = async (req, res) => {
  try {
    const { phoneNumber, emailId, password, name, businessName, businessAddress, businessType } = req.body;

    const existingSeller = await Seller.findOne({ email: emailId }).exec();
    if (existingSeller) {
      res.status(400).json({ error: 'Seller already exists' });
      return;
    }

    const sellerId = await generateUniqueSellerId();

    const seller = new Seller({
      name,
      phoneNumber,
      email: emailId,
      password,
      sellerId,
      businessName,
      businessAddress,
      businessType,
      emailVerified: false,
      phoneVerified: false
    });

    await seller.save();
    req.session.sellerId = sellerId;
    res.status(201).json({ message: 'Seller registered successfully', sellerId });
  } catch (error: any) {
    res.status(500).json({ error: 'Error registering seller' });
  }
};

const sellerLoginHandler: RequestHandler<
  ParamsDictionary,
  any,
  SellerLoginRequest
> = async (req, res) => {
  try {
    const { sellerId, emailOrPhone, password } = req.body;

    const seller = await Seller.findOne({
      sellerId,
      $or: [
        { email: emailOrPhone },
        { phoneNumber: emailOrPhone }
      ]
    }).exec();

    if (!seller) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    req.session.sellerId = sellerId;
    res.status(200).json({ message: 'Login successful', sellerId });
  } catch (error: any) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

const sellerLogoutHandler: RequestHandler = (req, res) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Error logging out' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Seller logout successful' });
  });
};

const getSellerDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findOne(
      { sellerId },
      { name: 1, businessName: 1, businessAddress: 1, businessType: 1, _id: 0 }
    ).exec();
    
    if (!seller) {
      res.status(404).json({ error: 'Seller not found' });
      return;
    }
    
    res.status(200).json(seller);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching seller details' });
  }
};

// Route registrations
router.post('/signup', userSignupHandler);
router.post('/login', userLoginHandler);
router.post('/logout', userLogoutHandler);
router.get('/user/:userId', getUserDetailsHandler);
router.post('/seller/signup', sellerSignupHandler);
router.post('/seller/login', sellerLoginHandler);
router.post('/seller/logout', sellerLogoutHandler);
router.get('/seller/:sellerId', getSellerDetailsHandler);

export default router;
