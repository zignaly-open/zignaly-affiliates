import React, {useCallback, useContext, useMemo, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import Lock from '@material-ui/icons/Lock';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import { REWARD_PERCENT, SERVICE_TYPE_MONTHLY_FEE } from '../../util/constants';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import CampaignForm from './CampaignForm';
import CampaignAffiliateView from "./CampaignAffiliateView";


const MarketplaceCampaign = () => {
  const { api, user } = useContext(appContext);
  const { id } = useParams();
  const { loading, error, value: campaign, retry } = useAsyncRetry(
    async () => api.get(`campaign/marketplace/${id}`),
    [id],
  );

  const [activating, setIsActivating] = useState(false);
  const activate = useCallback(async () => {
    setIsActivating(true);
    await api.post('campaign/activate/' + campaign._id);
    // TODO: error handling
    retry();
    setIsActivating(false)
  }, [retry, campaign]);

  return (
    <Content title={campaign ? campaign.name : 'View Campaign...'} noHr>
        <>
          {(loading || activating) && <Loader />}
          {error && <Fail />}
          {!(loading || activating) && campaign && <CampaignAffiliateView activate={activate} campaign={campaign} />}
          {!(loading || activating) && !error && !campaign && <Fail text="Not found" />}
        </>
    </Content>
  );
};

export default MarketplaceCampaign;
