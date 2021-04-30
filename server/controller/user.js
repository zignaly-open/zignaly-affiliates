import crypto from 'crypto';
import User, { FORBIDDEN_FIELDS, USER_ROLES } from '../model/user';
import { signToken } from '../service/jwt';
import { PASSWORD_RESET_TOKEN_TTL } from '../config';
import {
  INTERVAL_BETWEEN_USERS_SENDING_EMAILS,
  sendEmailFromAnotherUser,
  sendPasswordReset,
} from '../service/email';
import Campaign from '../model/campaign';

const userById = id => User.findById(id).lean();

export const getCurrentUser = async (req, res) => {
  const user = await userById(req.user._id);
  if (user.role === USER_ROLES.MERCHANT) {
    user.hasDefaultCampaign = !!(await Campaign.findOne({
      merchant: user,
      isDefault: true,
    }));
  }
  res.json(user);
};

export const getMerchantProfile = async (req, res) => {
  const merchant = await User.findOne(
    {
      _id: req.params.id,
      role: USER_ROLES.MERCHANT,
    },
    '-email',
  ).lean();
  res.json(merchant);
};

export const updateCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '+salt +hashedPassword',
  );
  const { newPassword, oldPassword, ...fields } = req.body;

  if (newPassword) {
    if (user.authenticate(oldPassword)) {
      user.password = newPassword;
    } else {
      return res
        .status(403)
        .json({ errors: { oldPassword: 'Invalid old password' } });
    }
  }

  for (const [k, v] of Object.entries(fields)) {
    if (!FORBIDDEN_FIELDS.includes(k)) {
      user[k] = typeof v !== 'undefined' ? v : user[k];
    }
  }

  try {
    await user.save();
    return getCurrentUser(req, res);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const create = async (req, res) => {
  const newUser = new User(req.body);
  newUser.provider = 'local';
  try {
    const user = await newUser.save();
    const token = signToken(user._id);
    res.status(201).json({ token, user: await userById(user._id) });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const authenticate = async (req, res) => {
  const token = signToken(req.user._id);
  res.json({ token, user: await userById(req.user._id) });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.resetPasswordToken = crypto.randomBytes(40).toString('hex');
    user.resetPasswordTokenExpirationDate =
      Date.now() + PASSWORD_RESET_TOKEN_TTL;
    await user.save();
    await sendPasswordReset({
      email,
      resetToken: user.resetPasswordToken,
    });
  }
  res.status(user ? 200 : 404).json({ success: !!user });
};

export const sendEmail = async (req, res) => {
  const { text } = req.body;
  const recipient = await User.findOne({ _id: req.params.id });
  const sender = await User.findById(req.user._id);
  if (
    Date.now() - +sender.lastTimeEmailWasSent <
    INTERVAL_BETWEEN_USERS_SENDING_EMAILS
  ) {
    res.status(400).json({
      errors: {
        text:
          'You have already sent an email less than 10 minutes ago. Please wait',
      },
    });
  } else {
    sender.lastTimeEmailWasSent = Date.now();
    await sendEmailFromAnotherUser({
      email: recipient.email,
      emailFrom: sender.email,
      text,
    });
    await sender.save();
    res.status(200).json({ success: true });
  }
};

const getUserByResetToken = token =>
  token &&
  User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpirationDate: { $gt: Date.now() },
  });

export const validatePasswordResetToken = async (req, res) => {
  const { token } = req.query;
  const user = await getUserByResetToken(token);
  res.json({ success: !!user });
};

export const resetPassword = async (req, res) => {
  const { token: resetToken, password } = req.body;
  const user = await getUserByResetToken(resetToken);
  if (user) {
    user.resetPasswordToken = null;
    user.password = password;
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({ token, user: await userById(user._id) });
  } else {
    res.status(404).json({ success: false });
  }
};
