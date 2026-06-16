const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendEmail } = require('../services/emailService');

// Helpers: Generate JWT Access and Refresh Tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medconnect_super_secret_jwt_key_987654321', {
    expiresIn: '1h',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'medconnect_refresh_super_secret_key_123456789', {
    expiresIn: '30d',
  });
};


// @desc    Register new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone, gender, role, ...otherDetails } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Set verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create base user (Wait, if this is the first user ever, we can make them Admin optionally, but let's stick to standard user creation)
    user = new User({
      name,
      email,
      password,
      phone,
      gender,
      role: role || 'Patient',
      verificationToken,
      isVerified: false, // Default false, requires email verification
    });

    // Save user
    await user.save();

    // If role is Doctor, create Doctor profile
    if (user.role === 'Doctor') {
      const { specialization, qualification, experience, consultationFee, hospitalName, clinicAddress } = otherDetails;
      
      const doctor = new Doctor({
        userId: user._id,
        specialization: specialization || 'General Medicine',
        qualification: qualification || 'MBBS',
        experience: experience || 1,
        consultationFee: consultationFee || 200,
        hospitalName: hospitalName || 'General Hospital',
        clinicAddress: clinicAddress || 'Downtown Clinic Address',
        approved: false, // Must be approved by admin
      });
      await doctor.save();
    } 
    // If role is Patient, create Patient profile
    else if (user.role === 'Patient') {
      const { age, bloodGroup, emergencyContact, address } = otherDetails;

      const patient = new Patient({
        userId: user._id,
        age: age || 18,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || 'N/A',
        address: address || 'N/A',
      });
      await patient.save();
    }

    // Send verification email
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const message = `Welcome to MedConnect! Please verify your account by making a GET request to: \n\n ${verifyUrl} \n\nOr click verify on the frontend.`;
    
    await sendEmail({
      email: user.email,
      subject: 'MedConnect Account Verification',
      message: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0ea5e9;">Welcome to MedConnect!</h2>
          <p>Thank you for signing up. Please verify your email address to active your profile.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0;">Verify Email</a>
          <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this link in your browser: <br/> ${verifyUrl}</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Fetch full profile info depending on role
    let profileData = {};
    if (user.role === 'Doctor') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) {
        profileData = doc;
      }
    } else if (user.role === 'Patient') {
      const pat = await Patient.findOne({ userId: user._id });
      if (pat) {
        profileData = pat;
      }
    }

    res.status(200).json({
       success: true,
       token: generateAccessToken(user._id),
       refreshToken: generateRefreshToken(user._id),
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         phone: user.phone,
         gender: user.gender,
         profileImage: user.profileImage,
         role: user.role,
         isVerified: user.isVerified,
         createdAt: user.createdAt,
         profile: profileData,
       },
     });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Optionally redirect on success if requested from browser. Or just return json response.
    // We will return JSON, but also support a nice message.
    res.status(200).send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background-color: #f8fafc;}
            .card { background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: inline-block; padding: 40px; max-width: 400px; }
            h1 { color: #0ea5e9; }
            a { background: #0ea5e9; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Email Verified!</h1>
            <p>Your MedConnect account has been verified successfully.</p>
            <p>You can now return to the app and login.</p>
            <a href="http://localhost:5173/login">Go to Login</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).send('Server error during email verification');
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save();

    // Reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'MedConnect Password Reset Link',
        message: message,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #ef4444;">Reset Password Request</h2>
            <p>You requested a password reset. Click the button below to set a new password.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0;">Reset Password</a>
            <p style="font-size: 12px; color: #64748b;">This link will expire in 1 hour.</p>
          </div>
        `,
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during forgot-password request' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.resetToken;

  // Get hashed token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profileData = {};
    if (user.role === 'Doctor') {
      const doc = await Doctor.findOne({ userId: user._id });
      if (doc) {
        profileData = doc;
      }
    } else if (user.role === 'Patient') {
      const pat = await Patient.findOne({ userId: user._id });
      if (pat) {
        profileData = pat;
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, phone, gender, profileImage, ...extraFields } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update base user details
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    let profileData = {};

    // Role specific details
    if (user.role === 'Doctor') {
      const { specialization, qualification, experience, consultationFee, hospitalName, clinicAddress, availability } = extraFields;
      
      const doc = await Doctor.findOne({ userId: user.id });
      if (doc) {
        if (specialization) doc.specialization = specialization;
        if (qualification) doc.qualification = qualification;
        if (experience !== undefined) doc.experience = experience;
        if (consultationFee !== undefined) doc.consultationFee = consultationFee;
        if (hospitalName) doc.hospitalName = hospitalName;
        if (clinicAddress) doc.clinicAddress = clinicAddress;
        if (availability) doc.availability = availability;
        await doc.save();
        profileData = doc;
      }
    } else if (user.role === 'Patient') {
      const { age, bloodGroup, emergencyContact, address } = extraFields;

      const pat = await Patient.findOne({ userId: user.id });
      if (pat) {
        if (age !== undefined) pat.age = age;
        if (bloodGroup) pat.bloodGroup = bloodGroup;
        if (emergencyContact) pat.emergencyContact = emergencyContact;
        if (address) pat.address = address;
        await pat.save();
        profileData = pat;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Get all registered users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users list' });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If doctor/patient, delete respective schema to avoid orphans
    if (user.role === 'Doctor') {
      await Doctor.deleteOne({ userId: user._id });
    } else if (user.role === 'Patient') {
      await Patient.deleteOne({ userId: user._id });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user account' });
  }
};

// @desc    Get all registered users public (No authorization required for local developer access)
// @route   GET /api/auth/users-public
// @access  Public
exports.getAllUsersPublic = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        verificationToken: u.verificationToken,
        createdAt: u.createdAt
      })),
    });
  } catch (error) {
    console.error('Fetch public users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching public users list' });
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'medconnect_refresh_super_secret_key_123456789');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token user' });
    }

    const token = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

