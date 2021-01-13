import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Pagination from '@material-ui/lab/Pagination';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import { USER_MERCHANT } from '../../util/constants';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import { AffiliateCampaignListItem } from './CampaignListElement';
import Muted from '../../common/atoms/Muted';
import Tabs from '../../common/molecules/Tabs';

const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';
const FILTER_ARCHIVE = 'archive';

const tabs = [
  { value: FILTER_ALL, label: 'All campaigns' },
  { value: FILTER_ACTIVE, label: 'My active campaigns' },
  { value: FILTER_ARCHIVE, label: 'Archive' },
];

const Marketplace = () => {
  const { api, user } = useContext(appContext);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(FILTER_ALL);
  const history = useHistory();
  const { loading, error, value } = useAsync(
    async () =>
      api.get(`campaign/${
        {
          [FILTER_ALL]: 'marketplace',
          [FILTER_ACTIVE]: 'active',
          [FILTER_ARCHIVE]: 'archive',
        }[tab] || ''
      }`, {
        page,
      }),
    [page, tab],
  );

  const openCampaign = useCallback(
    campaign => history.push(`/campaigns/${campaign._id}`),
    [history],
  );

  const { campaigns, pages } = value || {};

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

          {campaigns.map(campaign => (
            <AffiliateCampaignListItem
              onClick={openCampaign}
              key={campaign._id}
              campaign={campaign}
            />
          ))}
          {campaigns.length === 0 && (
            <Muted block marginBottom={20}>
              No results
            </Muted>
          )}
          {pages > 0 && (
            <Pagination
              count={pages}
              page={page}
              onChange={(event, i) => setPage(i)}
            />
          )}
        </>
      )}
    </Content>
  );
};

export default Marketplace;
