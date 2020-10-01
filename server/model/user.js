import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

export const USER_ROLES = {
  AFFILIATE: 'AFFILIATE',
  MERCHANT: 'MERCHANT',
};

export const USER_UPDATEABLE_FIELDS = ['name', 'email', 'mailingList'];

const UserSchema = new Schema({
  name: { type: String, required: 'Name is required' },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: 'Email address is required',
    validate: {
      async validator(value) {
        const existingUser = await this.constructor.findOne({ email: value });
        return !existingUser || this.id === existingUser.id;
      },
      message: 'The specified email address is already in use.',
    },
  },
  hashedPassword: {
    type: String,
    validate: {
      validator: hashedPassword => hashedPassword.length,
      message: 'Password cannot be blank',
    },
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordTokenExpirationDate: {
    type: Date,
    select: false,
  },
  salt: {
    type: String,
    select: false,
  },
  mailingList: {
    type: Boolean,
  },
  role: {
    type: String,
    required: 'Required',
    validate: {
      validator: role => role && USER_ROLES[role] === role,
      message: 'A role should be selected',
    },
  },
});

UserSchema.virtual('password').set(function (password) {
  this.salt = this.makeSalt();
  this.hashedPassword = this.encryptPassword(password);
});

UserSchema.virtual('profile').get(function () {
  return {
    name: this.name,
    role: this.role,
  };
});

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword(password) {
    if (!password || !this.salt) return '';
    const salt = Buffer.from(this.salt, 'base64');
    return crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
      .toString('base64');
  },
};

export default mongoose.model('User', UserSchema);
