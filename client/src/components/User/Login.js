import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Content from '../../common/Content';
import Input from '../../common/molecules/Input';
import Button from '../../common/Button';
import { appContext } from '../../context/app';
import { EMAIL_REGEX, setFormErrors } from '../../util/form';
import FormSubAction from '../../common/atoms/FormSubAction';
import Captcha, { resetCaptchas } from '../../common/Captcha';

const Login = () => {
  const { api, setToken, setUser } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, errors, setError, setValue } = useForm();
  useEffect(() => {
    register({ name: 'captcha' }, { required: 'You must pass the challenge' });
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        const { token, user } = await api.post('user/auth', values);
        setUser(user);
        setToken(token);
      } catch (error) {
        resetCaptchas();
        setFormErrors(error, setError);
        if (error.success === false) {
          setError('email', {});
          setError('password', {
            type: 'manual',
            message: 'Invalid username or password',
          });
        }
        setLoading(false);
      }
    },
    [api, setError, setToken, setUser],
  );

  return (
    <Content title="Log in" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          name="email"
          placeholder="Your email address"
          title="Email"
          error={errors.email}
          useRef={register({
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
          useRef={register({
            required: 'Required',
          })}
        />

        <Captcha
          error={errors.captcha}
          onChange={token => setValue('captcha', token)}
        />

        <Button primary type="submit" isLoading={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>

        <FormSubAction>
          <Link to="/forgot-password">Forgot password?</Link>
        </FormSubAction>
      </form>
    </Content>
  );
};

export default Login;
