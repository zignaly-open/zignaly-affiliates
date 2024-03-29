import React, { useContext } from 'react';
import { appContext } from '../../contexts/app';
import { USER_AFFILIATE } from '../../util/constants';
import AffiliateDashboard from './AffiliateDashboard';
import MerchantDashboard from './MerchantDashboard';
// import GuestDashboard from './GuestDashboard';
import Maintenance from './Maintenance';

const Dashboard = () => {
  const { user } = useContext(appContext);
  if (!user?._id) {
    // return <GuestDashboard />;
    return <Maintenance />;
  }
  return user.role === USER_AFFILIATE ? (
    <AffiliateDashboard />
  ) : (
    <MerchantDashboard />
  );
};

export default Dashboard;
