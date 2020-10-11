import React, {useContext} from 'react';
import {useHistory} from "react-router-dom";
import Content from "../../common/Content";
import {appContext} from "../../context/app";
import {USER_MERCHANT} from "../../util/constants";
import useAsync from "react-use/lib/useAsync";
import Loader from "../../common/Loader";
import Fail from "../../common/Fail";
import Button from "../../common/Button";

const Campaigns = () => {
  const { api, user } = useContext(appContext);
  const history = useHistory();
  const { loading, error, value: campaign } = useAsync(async () => api.get(`campaign/my`), []);

  return (
    <Content title="Campaigns"
             actions={
               <Button compact onClick={() => history.push('/my/campaigns/new')} minWidth={100}>Create campaign</Button>
             }
             description={user.role === USER_MERCHANT ? 'Browse your campaigns' : 'Browse campaigns available to you'}>
      {loading && <Loader />}
      {error && <Fail />}
      {campaign && JSON.stringify(campaign)}
    </Content>
  );
};

export default Campaigns;
