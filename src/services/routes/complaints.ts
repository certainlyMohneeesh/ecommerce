import { Request, Response, Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import nodemailer from 'nodemailer';
import { Complaint } from '../models/complaintModel';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

interface ComplaintRequest {
  name: string;
  email: string;
  message: string;
  userType: string;
}

interface UpdateStatusRequest {
  complaintId: string;
  status: string;
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

const sendConfirmationEmail = async (email: string, complaintNumber: string, message: string) => {
  try {
    const mailOptions = {
      from: '"Mera Bestie" <pecommerce8@gmail.com>',
      to: email,
      subject: 'Complaint Registration Confirmation',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; background-color: #ffffff;">
          <div style="background-color: #ffb6c1; padding: 15px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="font-family: 'Brush Script MT', cursive; color: #ffffff; font-size: 36px; margin: 0;">Mera Bestie</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Complaint Registration Confirmation</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Complaint ID:</strong> ${complaintNumber}</p>
              <p style="margin: 10px 0;"><strong>Issue Description:</strong></p>
              <p style="margin: 10px 0; font-style: italic; color: #555;">${message}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.5;">
              Thank you for reaching out to us! Our experienced specialists are already working on resolving your issue. You can expect a detailed reply to your query within 24 hours. We appreciate your patience and understanding.
            </p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #95a5a6; font-size: 12px; line-height: 1.4;">
              This is an automated email. Please do not reply to this message.<br>
              If you have any additional questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      `,
      text: `
        Mera Bestie\n\nComplaint Registration Confirmation\n\nComplaint ID: ${complaintNumber}\n\nIssue Description:\n${message}\n\nThank you for reaching out to us! Our experienced specialists are already working on resolving your issue. You can expect a detailed reply to your query within 24 hours. We appreciate your patience and understanding.\n\nThis is an automated email. Please do not reply to this message.\nIf you have any additional questions, feel free to contact our support team.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

// POST /post-complaints
router.post('/post-complaints', async (req: Request<{}, {}, ComplaintRequest>, res: Response) => {
  try {
    const { name, email, message, userType } = req.body;
    const complaintNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const complaintData = {
      complaintNumber,
      name,
      email,
      message,
      userType
    };

    const complaint = new Complaint(complaintData);
    const result = await complaint.save();
    await sendConfirmationEmail(email, complaintNumber, message);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error registering complaint',
      error: error.message
    });
  }
});

// Get all complaints
router.get('/get-complaints', async (_req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
});

// Update the complaint status
const updateComplaintStatusHandler: RequestHandler<
  ParamsDictionary,
  any,
  UpdateStatusRequest
> = async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    const updatedComplaint = await Complaint.findOneAndUpdate(
      { complaintNumber: complaintId },
      { $set: { status } },
      { new: true }
    ).exec();

    if (!updatedComplaint) {
      res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status',
      error: error.message
    });
  }
};

router.put('/update-complaint-status', updateComplaintStatusHandler);

export default router;
