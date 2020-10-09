import React, { useContext } from 'react';
import { appContext } from '../../context/app';
import { USER_AFFILIATE } from '../../util/constants';
import AffiliateDashboard from './AffiliateDashboard';
import MerchantDashboard from './MerchantDashboard';

const Dashboard = () => {
  const { user } = useContext(appContext);
  return user.role === USER_AFFILIATE ? (
    <AffiliateDashboard />
  ) : (
    <MerchantDashboard />
  );
};

export default Dashboard;
