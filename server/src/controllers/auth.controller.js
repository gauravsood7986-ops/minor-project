import crypto from 'crypto';
import { User } from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { generateCsrfToken, setCsrfCookie } from '../middleware/csrf.js';
import { sendEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, username, password, college } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({
        success: false,
        message: `${field} is already registered. Please choose another or sign in.`,
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      college: college || '',
      emailVerifyToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
    });

    await user.save();

    // Generate session token and set cookies
    const token = signToken(user._id);
    setAuthCookie(res, token);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    // Send verification email asynchronously
    sendEmail({
      to: user.email,
      subject: 'Verify your CampusGig account',
      text: `Welcome to CampusGig, ${user.name}! Use token: ${verificationToken} to verify your account.`,
    }).catch((err) => console.error('Verification email error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.toJSON(),
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: user.toJSON(),
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON(),
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Consistent response to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'CampusGig Password Reset',
      text: `You requested a password reset. Use this token: ${resetToken} to reset your password within 1 hour.`,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is invalid or has expired',
      });
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCsrfToken = (req, res) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  return res.status(200).json({
    success: true,
    data: { csrfToken },
  });
};
