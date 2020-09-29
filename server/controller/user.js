import crypto from 'crypto';
import User, { USER_UPDATEABLE_FIELDS } from '../model/user';
import { signToken } from '../service/jwt';
import { PASSWORD_RESET_TOKEN_TTL } from '../config';

// request-reset
// reset

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json(user);
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
      return res.status(403).json({ error: 'Invalid old password' });
    }
  }

  for (const [k, v] of Object.entries(fields)) {
    if (!USER_UPDATEABLE_FIELDS.includes(k)) {
      return res
        .status(400)
        .json({ error: `You can not update the "${k}" field` });
    }
    user[k] = v;
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
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const authenticate = (req, res) => {
  const token = signToken(req.user._id);
  res.json({ token });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.resetPasswordToken = crypto.randomBytes(40).toString('hex');
    user.resetPasswordTokenExpirationDate =
      Date.now() + PASSWORD_RESET_TOKEN_TTL;
    await user.save();
  }
  // TODO: email
  res.status(user ? 200 : 404).json({ success: !!user });
};

const getUserByResetToken = token =>
  User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpirationDate: { $gt: Date.now() },
  });

export const validatePasswordResetToken = async (req, res) => {
  const { token } = req.body;
  const user = await getUserByResetToken(token);
  res.status(user ? 200 : 404).json({ success: !!user });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await getUserByResetToken(token);
  if (user) {
    user.password = password;
    await user.save();
  }
  res
    .status(user ? 200 : 404)
    .json({ success: !!user, email: user && user.email });
};
