import React, { useCallback, useContext, useState } from 'react';
import {useForm} from 'react-hook-form';
import { Link } from 'react-router-dom';
import Content from '../common/Content';
import Input from '../common/Input';
import Button from '../common/Button';
import { appContext } from '../context/app';
import { EMAIL_REGEX, PASSWORD_REGEX, setFormErrors } from '../util/form';
import FormSubAction from '../common/FormSubAction';
import Message from "../common/Message";


const Profile = () => {
  const { api, user, setUser } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const { handleSubmit, register, errors, watch, setError, setValue } = useForm({
    defaultValues: {
      ...user
    },
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        const user = await api.put('user/me', values);
        setUser(user);
        setChangePassword(false)
        setIsSaved(true)
        setValue('newPassword', '');
        setValue('oldPassword', '');
        setValue('repeatPassword', '');
      } catch (error) {
        setFormErrors(error, setError);
      }
      setLoading(false);
    },
    [api, setError, setUser],
  );

  return (
    <Content title="Profile" description="Edit profile data">
      {isSaved && <Message success>Changes saved</Message>}
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
          type="checkbox"
          title="Change password"
          onClick={() => setChangePassword(v => !v)}
        />

        {changePassword && (<>

        <Input
          type="password"
          name="newPassword"
          placeholder="Super strong new password"
          title="Password"
          error={errors.newPassword}
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
          placeholder="Repeat new password"
          title="Repeat password"
          error={errors.repeatPassword}
          useRef={register({
            validate: value =>
              value === watch('oldPassword') || 'Passwords do not match',
          })}
        />

        <Input
          type="password"
          name="oldPassword"
          placeholder="Your current password"
          title="Old Password"
          error={errors.oldPassword}
          useRef={register({
            required: 'Required',
            pattern: {
              value: PASSWORD_REGEX,
              message:
                'Your password should contain letters and special characters or digits & 8 characters min',
            },
          })}
        />

        </>)}
        <Input
          type="checkbox"
          name="mailingList"
          title="Accept promotional materials"
          useRef={register({})}
        />

        <Button primary type="submit" isLoading={loading || undefined}>
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </form>
    </Content>
  );
};

export default Profile;
