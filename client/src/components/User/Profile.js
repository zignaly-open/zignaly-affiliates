import React, { useContext } from 'react';
import useConstant from 'use-constant';
import Content from '../../common/molecules/Content';
import { appContext } from '../../contexts/app';
import { USER_MERCHANT } from '../../util/constants';
import ProfileForm from './ProfileForm';

const Profile = () => {
  const { user } = useContext(appContext);
  const isMerchant = useConstant(() => user.role === USER_MERCHANT);

  return (
    <Content
      title={`${isMerchant ? 'Merchant' : 'Affiliate'} Profile`}
      description="Edit profile data"
    >
      <ProfileForm />
    </Content>
  );
};

export default Profile;
