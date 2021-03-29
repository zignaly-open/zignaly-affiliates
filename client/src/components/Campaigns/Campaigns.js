import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Content from '../../common/molecules/Content';
import Button from '../../common/atoms/Button';
import Tabs from '../../common/molecules/Tabs';
import CampaignListMerchant from './CampaignListMerchant';
import CampaignListAffiliate from './CampaignListAffiliate';

const MY_CAMPAIGNS = 'my campaigns';
const MARKETPLACE = 'marketplace';

const tabs = [
  { value: MY_CAMPAIGNS, label: 'My campaigns' },
  { value: MARKETPLACE, label: 'Marketplace' },
];

const Campaigns = () => {
  const history = useHistory();
  const [tab, setTab] = useState(MY_CAMPAIGNS);

  return (
    <Content
      title={tab === MY_CAMPAIGNS ? 'My campaigns' : 'Marketplace'}
      hideHr
      actions={
        <Button
          compact
          onClick={() => history.push('/my/campaigns/new')}
          minWidth={100}
        >
          Create campaign
        </Button>
      }
      description={
        tab === MY_CAMPAIGNS
          ? 'Browse your campaigns'
          : 'Browse all campaigns on the Marketplace'
      }
    >
      <Tabs setTab={setTab} selectedTab={tab} tabs={tabs} />

      {tab === MY_CAMPAIGNS ? (
        <CampaignListMerchant />
      ) : (
        <CampaignListAffiliate mode="marketplace" />
      )}
    </Content>
  );
};

export default Campaigns;
