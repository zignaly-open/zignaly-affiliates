import React, { useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Content from '../common/Content';
import Input from '../common/Input';
import Button from '../common/Button';
import { appContext } from '../context/app';
import { EMAIL_REGEX, PASSWORD_REGEX, setFormErrors } from '../util/form';

const Register = () => {
  const { api, setToken, setUser } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, errors, watch, setError } = useForm({
    defaultValues: {
      mailingList: true,
    },
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        const { token, user } = await api.post('user', values);
        setUser(user);
        setToken(token);
      } catch (error) {
        setFormErrors(error, setError);
        setLoading(false);
      }
    },
    [api, setError, setToken, setUser],
  );

  return (
    <Content title="Sign up" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          title="Name"
          error={errors.name}
          useRef={register({
            required: 'Required',
          })}
        />

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
          useRef={register({
            validate: value =>
              value === watch('password') || 'Passwords do not match',
          })}
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
          useRef={register({
            required: 'Required',
          })}
        />

        <Input
          type="checkbox"
          name="mailingList"
          title="Accept promotional materials"
          useRef={register({})}
        />

        <Button primary type="submit" isLoading={loading || undefined}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Content>
  );
};

export default Register;
