import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAsync } from 'react-use';
import Input from '../../common/molecules/Input';
import { MerchantCampaignListItem } from './CampaignListElement';
import Muted from '../../common/atoms/Muted';
import { appContext } from '../../contexts/app';
import Loader from '../../common/atoms/Loader';
import Fail from '../../common/molecules/Fail';

const CampaignListMerchant = () => {
  const { api } = useContext(appContext);
  const [textFilter, setTextFilter] = useState('');
  const history = useHistory();
  const { loading, error, value: campaigns } = useAsync(
    async () => api.get(`campaign/my`),
    [],
  );

  const filteredCampaigns = useMemo(() => {
    const lowercasedFilter = textFilter.toLocaleLowerCase();
    const match = x =>
      ['description', 'shortDescription', 'name'].some(k =>
        x[k].toLocaleLowerCase().includes(lowercasedFilter),
      );
    return (campaigns || []).filter(x => !textFilter || match(x));
  }, [campaigns, textFilter]);

  const openCampaign = useCallback(
    campaign => history.push(`/my/campaigns/${campaign._id}`),
    [history],
  );

  return (
    <>
      {loading && <Loader />}
      {error && <Fail />}
      {campaigns && (
        <>
          <Input
            type="text"
            onChange={e => setTextFilter(e.target.value)}
            value={textFilter}
            placeholder="Filter"
          />
          {filteredCampaigns.map(campaign => (
            <MerchantCampaignListItem
              onClick={openCampaign}
              key={campaign._id}
              campaign={campaign}
            />
          ))}
          {filteredCampaigns.length === 0 && <Muted>No results</Muted>}
        </>
      )}
    </>
  );
};

export default CampaignListMerchant;

CampaignListMerchant.propTypes = {};
