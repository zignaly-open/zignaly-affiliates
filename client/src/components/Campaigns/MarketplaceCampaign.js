import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import Content from '../../common/molecules/Content';
import { appContext } from '../../contexts/app';
import { AffiliateCampaignProvider } from '../../contexts/affiliateCampaign';
import Loader from '../../common/atoms/Loader';
import Fail from '../../common/molecules/Fail';
import CampaignAffiliateView from './CampaignAffiliateView';

const MarketplaceCampaign = () => {
  const { api } = useContext(appContext);
  const { id } = useParams();
  const { loading, error, value: campaign, retry } = useAsyncRetry(
    async () =>
      api
        .get(`campaign/marketplace/${id}`)
        .finally(() => setDoNotShowSpinner(false)),
    [id],
  );

  const [doNotShowSpinner, setDoNotShowSpinner] = useState(false);
  const [activating, setIsActivating] = useState(false);
  const activate = useCallback(async () => {
    setIsActivating(true);
    await api.post(`campaign/activate/${campaign._id}`);
    // TODO: error handling
    retry();
    setIsActivating(false);
  }, [retry, campaign, api]);

  const retrySilently = useCallback(async () => {
    setDoNotShowSpinner(true);
    retry();
  }, [retry]);

  return (
    <Content title={campaign ? campaign.name : 'View Campaign...'} noHr>
      <AffiliateCampaignProvider
        value={{
          campaign,
          loading,
          reloadCampaign: retry,
          reloadCampaignSilently: retrySilently,
        }}
      >
        {((!doNotShowSpinner && loading) || activating) && <Loader />}
        {error && <Fail />}
        {!((!doNotShowSpinner && loading) || activating) && campaign && (
          <CampaignAffiliateView activate={activate} campaign={campaign} />
        )}
        {!((!doNotShowSpinner && loading) || activating) &&
          !error &&
          !campaign && <Fail text="Not found" />}
      </AffiliateCampaignProvider>
    </Content>
  );
};
export default MarketplaceCampaign;
