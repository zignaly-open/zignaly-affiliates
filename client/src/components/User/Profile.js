import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useConstant from 'use-constant';
import Content from '../../common/Content';
import Input, { InputTitle, Separator } from '../../common/molecules/Input';
import Button from '../../common/Button';
import { appContext } from '../../context/app';
import {
  BTC_REGEX,
  EMAIL_REGEX,
  ERC20_REGEX,
  PASSWORD_REGEX,
  setFormErrors,
} from '../../util/form';
import Message from '../../common/atoms/Message';
import { SERVICE_BASE, USER_MERCHANT } from '../../util/constants';
import FileInput from '../../common/molecules/FileInput';

const Profile = () => {
  const { api, user, setUser } = useContext(appContext);
  const isMerchant = useConstant(() => user.role === USER_MERCHANT);
  useEffect(() => {
    isMerchant && register({ name: 'logoUrl' }, { required: 'Required' });
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const { handleSubmit, register, errors, watch, setError, setValue } = useForm(
    {
      defaultValues: {
        ...user,
      },
    },
  );

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        const updatedUser = await api.put('user/me', values);
        setUser(updatedUser);
        setChangePassword(false);
        setIsSaved(true);
        setValue('newPassword', '');
        setValue('oldPassword', '');
        setValue('repeatPassword', '');
      } catch (error) {
        setFormErrors(error, setError);
      }
      setLoading(false);
    },
    [api, setError, setUser, setValue],
  );

  return (
    <Content
      title={`${isMerchant ? 'Merchant' : 'Affiliate'} Profile`}
      description="Edit profile data"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          isRequired
          title="Name"
          error={errors.name}
          useRef={register({ required: 'Required' })}
        />

        <Input
          type="email"
          name="email"
          placeholder="Your email address"
          isRequired
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

        {!isMerchant && (
          <>
            <Separator />
            <InputTitle marginBottom={18} block>
              Payment methods
            </InputTitle>

            <Input
              type="text"
              name="paymentCredentials.paypal"
              placeholder="Paypal email"
              title="Paypal email"
              error={
                errors.paymentCredentials && errors.paymentCredentials.paypal
              }
              useRef={register({
                pattern: {
                  value: EMAIL_REGEX,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              type="text"
              name="paymentCredentials.bitcoin"
              placeholder="Bitcoin address"
              title="Bitcoin"
              error={
                errors.paymentCredentials && errors.paymentCredentials.bitcoin
              }
              useRef={register({
                pattern: {
                  value: BTC_REGEX,
                  message: 'Invalid BTC address',
                },
              })}
            />

            <Input
              type="text"
              name="paymentCredentials.usdt"
              placeholder="USDT address"
              title="USDT"
              error={
                errors.paymentCredentials && errors.paymentCredentials.usdt
              }
              useRef={register({
                pattern: {
                  value: ERC20_REGEX,
                  message: 'Invalid ERC20 address',
                },
              })}
            />
          </>
        )}

        {isMerchant && (
          <>
            <Input
              type="text"
              name="zignalyId"
              placeholder="Your Zignaly User ID"
              description={
                <>
                  ID can be found{' '}
                  <a
                    href="https://zignaly.com/app/dashboard/#settings-profile"
                    target="_blank"
                    rel="noreferrer"
                  >
                    here
                  </a>
                  .
                </>
              }
              title="Zignaly User ID"
              isRequired
              error={errors.zignalyId}
              useRef={register({ required: 'Required' })}
            />

            <Input
              type="textarea"
              name="aboutUs"
              rows={6}
              placeholder="Provide affiliates with some information about you (250 characters minumum)"
              title="About Us"
              isRequired
              error={errors.aboutUs}
              useRef={register({
                required: 'Required',
                validate: value =>
                  (value && value.length >= 250) ||
                  `250 characters minimum. You've entered ${value.length}`,
              })}
            />

            <Input
              type="textarea"
              name="termsAndConditions"
              rows={6}
              placeholder="Terms and conditions for your campaigns (optional)"
              title="Terms and conditions"
              error={errors.termsAndConditions}
              useRef={register({})}
            />

            <FileInput
              label="Logo"
              isRequired
              display={file =>
                file && <img src={file.path} alt={watch('name')} width={300} />
              }
              file={watch('logoUrl')}
              onChange={url => setValue('logoUrl', url)}
              error={errors.logoUrl}
              onError={uploadErrors => setFormErrors(uploadErrors, setError)}
              onUploadStarted={() => setUploading(true)}
              onUploadEnded={() => setUploading(false)}
            />

            <Separator />

            <InputTitle marginBottom={18} block isRequired>
              Accepted payout methods
            </InputTitle>

            <Input
              type="checkbox"
              name="paymentMethodSupport.paypal"
              title="PayPal"
              error={
                errors.paymentMethodSupport && errors.paymentMethodSupport.usdt
              }
              useRef={register({})}
            />

            <Input
              type="checkbox"
              name="paymentMethodSupport.bitcoin"
              title="Bitcoin"
              error={
                errors.paymentMethodSupport && errors.paymentMethodSupport.usdt
              }
              useRef={register({})}
            />

            <Input
              type="checkbox"
              name="paymentMethodSupport.usdt"
              title="USDT"
              error={
                errors.paymentMethodSupport && errors.paymentMethodSupport.usdt
              }
              useRef={register({
                validate: () =>
                  !!watch('paymentMethodSupport.paypal') ||
                  !!watch('paymentMethodSupport.bitcoin') ||
                  !!watch('paymentMethodSupport.usdt') ||
                  'At least one payment method should be suppoerd',
              })}
            />
          </>
        )}

        <Separator />

        <Input
          type="checkbox"
          title="Change password"
          onClick={() => setChangePassword(v => !v)}
        />

        {changePassword && (
          <>
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
                  value === watch('newPassword') || 'Passwords do not match',
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
          </>
        )}

        <Input
          type="checkbox"
          name="mailingList"
          title="Accept promotional materials"
          useRef={register({})}
        />

        {isSaved && <Message success>Changes saved</Message>}

        <Button
          primary
          type="submit"
          data-tootik={uploading ? 'Wait till the upload finished' : ''}
          disabled={uploading}
          isLoading={loading || undefined}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </form>
    </Content>
  );
};

export default Profile;
