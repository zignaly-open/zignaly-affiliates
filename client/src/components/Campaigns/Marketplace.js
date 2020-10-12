import React, {useCallback, useContext, useMemo, useState} from 'react';
import { useHistory } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import { USER_MERCHANT } from '../../util/constants';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import Button from '../../common/Button';
import {AffiliateCampaignListItem} from "./CampaignListElement";
import Pagination from '@material-ui/lab/Pagination';
import Input from "../../common/molecules/Input";
import Muted from "../../common/atoms/Muted";
import Tabs from "../../common/molecules/Tabs";

const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';

const tabs = [
  { value: FILTER_ALL, label: 'All campaigns' },
  {value: FILTER_ACTIVE, label: 'My active campaigns'}
];

const Marketplace = () => {
  const { api, user } = useContext(appContext);
  const [textFilter, setTextFilter] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(FILTER_ALL);
  const history = useHistory();
  const { loading, error, value } = useAsync(
    async () => api.get(`campaign/${tab === FILTER_ALL ? 'marketplace' : 'active'}`, { page }),
    [page, tab],
  );

  const { campaigns, pages } = value || {};

  const filteredCampaigns = useMemo(() => {
    const lowercasedFilter = textFilter.toLocaleLowerCase();
    const match = x => ['description', 'shortDescription', 'name'].some(k => x[k].toLocaleLowerCase().indexOf(lowercasedFilter) !== -1)
    return (campaigns || []).filter(x => !textFilter || match(x))
  }, [campaigns, textFilter])

  const openCampaign = useCallback(campaign => history.push(`/campaigns/${campaign._id}`), [history])

  return (
    <Content
      title="Campaigns Marketplace"
      hideHr
      description={
        user.role === USER_MERCHANT
          ? 'Browse your campaigns'
          : 'Browse campaigns available to you'
      }
    >
      {loading && <Loader />}
      {error && <Fail />}
      {!loading && campaigns && (
        <>
          <Tabs setTab={setTab} selectedTab={tab} tabs={tabs} />

          {filteredCampaigns.map(campaign => <AffiliateCampaignListItem onClick={openCampaign} key={campaign._id} campaign={campaign} />)}
          {filteredCampaigns.length === 0 && <Muted block marginBottom={20}>No results</Muted>}
          {pages > 0 && <Pagination count={pages} page={page} onChange={(event,i)=> setPage(i)} />}
        </>
      )}
    </Content>
  );
};

export default Marketplace;
