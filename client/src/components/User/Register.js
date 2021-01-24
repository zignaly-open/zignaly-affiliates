import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Content from '../../common/molecules/Content';
import Input from '../../common/molecules/Input';
import Button from '../../common/atoms/Button';
import { appContext } from '../../contexts/app';
import { EMAIL_REGEX, PASSWORD_REGEX, setFormErrors } from '../../util/form';
import FormSubAction from '../../common/atoms/FormSubAction';
import Captcha, { resetCaptchas } from '../../common/molecules/Captcha';
import { USER_AFFILIATE, USER_MERCHANT } from '../../util/constants';

const Register = () => {
  const { api, setToken, setUser } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, setValue, errors, watch, setError } = useForm(
    {
      mode: 'onBlur',
      defaultValues: {
        mailingList: true,
        role: USER_AFFILIATE,
      },
    },
  );

  useEffect(() => {
    register({ name: 'captcha' }, { required: 'You must pass the challenge' });
  });

  const onSubmit = async values => {
    setLoading(true);
    try {
      const { token, user } = await api.post('user', values);
      setUser(user);
      setToken(token);
    } catch (error) {
      resetCaptchas();
      setFormErrors(error, setError);
      setLoading(false);
    }
  };

  return (
    <Content title="Sign up" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          title="Name"
          error={errors.name}
          ref={register({
            required: 'Required',
          })}
        />

        <Input
          type="email"
          name="email"
          placeholder="Your email address"
          title="Email"
          error={errors.email}
          ref={register({
            required: 'Required',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          type="password"
          name="password"
          placeholder="Super strong password"
          title="Password"
          error={errors.password}
          ref={register({
            required: 'Required',
            pattern: {
              value: PASSWORD_REGEX,
              message:
                'Your password should contain letters and special characters or digits & 8 characters min',
            },
          })}
        />

        <Input
          type="password"
          name="repeatPassword"
          placeholder="Repeat password"
          title="Repeat password"
          error={errors.repeatPassword}
          ref={register({
            validate: value =>
              value === watch('password') || 'Passwords do not match',
          })}
        />

        <Input
          type="radio"
          name="role"
          inline
          value={USER_AFFILIATE}
          title="Affiliate"
          error={errors.role}
          ref={register()}
        />

        <Input
          type="radio"
          inline
          name="role"
          value={USER_MERCHANT}
          ref={register()}
          title="Merchant"
          error={errors.role}
        />

        <Input
          type="checkbox"
          name="tos"
          title={
            <span>
              Accept <Link to="/tos">terms and services</Link>
            </span>
          }
          error={errors.tos}
          ref={register({
            required: 'Required',
          })}
        />

        <Input
          type="checkbox"
          name="mailingList"
          title="Accept promotional materials"
          ref={register({})}
        />

        <Captcha
          error={errors.captcha}
          onChange={token => setValue('captcha', token)}
        />

        <Button primary type="submit" isLoading={loading || undefined}>
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <FormSubAction>
          <Link to="/login">Already have an account?</Link>
        </FormSubAction>
      </form>
    </Content>
  );
};

export default Register;
