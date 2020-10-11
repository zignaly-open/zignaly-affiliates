import React, {useContext, useMemo, useState} from 'react';
import { useHistory } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import { USER_MERCHANT } from '../../util/constants';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import Button from '../../common/Button';
import CampaignListItem from "./CampaignListElement";
import Input from "../../common/molecules/Input";

const Campaigns = () => {
  const { api, user } = useContext(appContext);
  const [textFilter, setTextFilter] = useState('');
  const history = useHistory();
  const { loading, error, value: campaigns } = useAsync(
    async () => api.get(`campaign/my`),
    [],
  );

  const filteredCampaigns = useMemo(() => {
    const lowercasedFilter = textFilter.toLocaleLowerCase();
    const match = x => ['description', 'shortDescription', 'name'].some(k => x[k].toLocaleLowerCase().indexOf(lowercasedFilter) !== -1)
    return (campaigns || []).filter(x => !textFilter || match(x))
  }, [campaigns, textFilter])

  return (
    <Content
      title="Campaigns"
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
        user.role === USER_MERCHANT
          ? 'Browse your campaigns'
          : 'Browse campaigns available to you'
      }
    >
      {loading && <Loader />}
      {error && <Fail />}
      {campaigns && (
        <>
          <Input type="text" onChange={e => setTextFilter(e.target.value)} value={textFilter} placeholder={"Filter"} />
          {filteredCampaigns.map(campaign => <CampaignListItem key={campaign._id} campaign={campaign} />)}
        </>
      )}
    </Content>
  );
};

export default Campaigns;
