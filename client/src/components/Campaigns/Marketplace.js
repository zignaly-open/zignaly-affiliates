import React, { useState } from 'react';
import Content from '../../common/molecules/Content';
import Tabs from '../../common/molecules/Tabs';
import CampaignListAffiliate from './CampaignListAffiliate';

const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';
const FILTER_ARCHIVE = 'archive';

const tabs = [
  { value: FILTER_ALL, label: 'All campaigns' },
  { value: FILTER_ACTIVE, label: 'My active campaigns' },
  { value: FILTER_ARCHIVE, label: 'Archive' },
];

const Marketplace = () => {
  const [tab, setTab] = useState(FILTER_ALL);

  return (
    <Content
      title="Campaigns Marketplace"
      hideHr
      description="Browse campaigns available to you"
    >
      <Tabs setTab={setTab} selectedTab={tab} tabs={tabs} />
      <CampaignListAffiliate
        mode={
          {
            [FILTER_ALL]: 'marketplace',
            [FILTER_ACTIVE]: 'active',
            [FILTER_ARCHIVE]: 'archive',
          }[tab] || ''
        }
      />
    </Content>
  );
};

export default Marketplace;
