import React, { useContext } from 'react';
import Content from '../../common/Content';
import { appContext } from '../../context/app';

const MerchantDashboard = () => {
  const { api, user, setUser } = useContext(appContext);
  return (
    <Content title="Dashboard">
      <p>Dashboard</p>
    </Content>
  );
};

export default MerchantDashboard;
