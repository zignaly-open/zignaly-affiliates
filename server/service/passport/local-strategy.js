import LocalStrategy from 'passport-local';
import User from '../../model/user';

const localStrategy = new LocalStrategy.Strategy(
  {
    usernameField: 'email',
    passwordField: 'password', // this is the virtual field on the model
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+salt +hashedPassword',
      );
      if (!user || !user.authenticate(password)) {
        return done(null, false, { message: 'No user by that email/password' });
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);

export default localStrategy;
