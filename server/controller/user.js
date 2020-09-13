import User, { USER_UPDATEABLE_FIELDS } from '../model/user';
import { signToken } from '../service/jwt';

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
