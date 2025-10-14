const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

// Debug: Check if .env file is being loaded
console.log('🔍 Checking environment variables...');
console.log('   GMAIL_USER:', process.env.GMAIL_USER ? '✅ Found' : '❌ Not found');
console.log('   GMAIL_PASS:', process.env.GMAIL_PASS ? '✅ Found' : '❌ Not found');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  const { to, otp, accountSid, authToken, from } = req.body;

  if (!to || !otp || !accountSid || !authToken || !from) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Validate phone number format (must be E.164 format)
    if (!to.match(/^\+[1-9]\d{1,14}$/)) {
      return res.status(400).json({ error: 'Invalid phone number format. Must be in E.164 format: +[country code][phone number]' });
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your WinQuizz verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: from,
      to: to
    });

    console.log('SMS sent successfully:', message.sid);
    res.status(200).json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: error.message || 'Failed to send SMS' });
  }
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    // Dynamic import for nodemailer to avoid initialization issues
    const nodemailer = require('nodemailer');
    
    const { to, otp, from, subject, html } = req.body;

    console.log('📧 Email request received:', { to, otpLength: otp?.length });

    if (!to || !otp) {
      console.log('❌ Missing parameters:', { to: !!to, otp: !!otp });
      return res.status(400).json({ error: 'Missing required parameters: to and otp' });
    }

    // Validate Gmail credentials
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    console.log('🔍 Gmail credentials check:', { 
      hasUser: !!gmailUser, 
      hasPass: !!gmailPass, 
      passLength: gmailPass ? gmailPass.length : 0,
      userValue: gmailUser,
      passFormat: gmailPass ? (gmailPass.includes(' ') ? 'contains spaces' : 'no spaces') : 'no pass'
    });

    if (!gmailUser || !gmailPass || gmailPass === 'your-app-password-here') {
      console.log('⚠️  Gmail credentials not configured. Using console fallback.');
      console.log(`📧 Email OTP for ${to}: ${otp}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Email configured for console logging (development mode)',
        messageId: 'console-fallback'
      });
    }

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    // Verify the transporter connection
    try {
      await transporter.verify();
      console.log('✅ Gmail transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Gmail transporter verification failed:', verifyError);
      throw verifyError;
    }

    // Email options
    const mailOptions = {
      from: from || gmailUser,
      to: to,
      subject: subject || 'WinQuizz Verification Code',
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">WinQuizz Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #333; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from WinQuizz. Please do not reply to this email.</p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    
    // Fallback to console logging
    console.log(`📧 Email OTP for ${req.body.to}: ${req.body.otp}`);
    res.status(200).json({ 
      success: true, 
      message: 'Email failed, using console fallback',
      messageId: 'console-fallback',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`📱 SMS endpoint: http://localhost:${PORT}/api/send-sms`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('💡 Note: Gmail credentials need to be configured in .env file for email functionality');
  console.log('💡 Current Gmail user:', process.env.GMAIL_USER || 'Not configured');
  console.log('💡 Gmail password:', process.env.GMAIL_PASS && process.env.GMAIL_PASS !== 'your-app-password-here' ? '✅ Configured' : '❌ Not configured (use app password, not regular password)');
  
  // Debug: Show all environment variables (without exposing sensitive data)
  console.log('');
  console.log('🔍 Debug: Environment variables loaded:');
  console.log('   GMAIL_USER exists:', !!process.env.GMAIL_USER);
  console.log('   GMAIL_PASS exists:', !!process.env.GMAIL_PASS);
  console.log('   GMAIL_PASS length:', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 0);
});
