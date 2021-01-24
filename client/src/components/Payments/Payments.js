import React, { useContext } from 'react';
import { appContext } from '../../contexts/app';
import { USER_AFFILIATE } from '../../util/constants';
import AffiliatePayments from './AffiliatePayments';
import MerchantPayments from './MerchantPayments';

const Payments = () => {
  const { user } = useContext(appContext);
  return user.role === USER_AFFILIATE ? (
    <AffiliatePayments />
  ) : (
    <MerchantPayments />
  );
};

export default Payments;
