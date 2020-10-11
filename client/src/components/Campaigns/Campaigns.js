import React, {useContext} from 'react';
import Content from "../../common/Content";
import {appContext} from "../../context/app";
import {USER_MERCHANT} from "../../util/constants";

const Campaigns = () => {
  const { api, user, setUser } = useContext(appContext);
  return (
    <Content title="Campaigns"
             description={user.role === USER_MERCHANT ? 'Browse your campaigns' : 'Browse campaigns available to you'} />
  );
};

export default Campaigns;
