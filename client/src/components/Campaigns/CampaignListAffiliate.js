import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAsync from 'react-use/lib/useAsync';
import Pagination from '@material-ui/lab/Pagination';
import { appContext } from '../../contexts/app';
import Loader from '../../common/atoms/Loader';
import Fail from '../../common/molecules/Fail';
import { AffiliateCampaignListItem } from './CampaignListElement';
import Muted from '../../common/atoms/Muted';

const CampaignListAffiliate = ({ mode }) => {
  const { api } = useContext(appContext);
  const [page, setPage] = useState(1);
  const history = useHistory();
  const { loading, error, value } = useAsync(
    async () =>
      api.get(`campaign/${mode}`, {
        page,
      }),
    [page, mode],
  );

  const openCampaign = useCallback(
    campaign => history.push(`/campaigns/${campaign._id}`),
    [history],
  );

  const { campaigns, pages } = value || {};

  return (
    <>
      {loading && <Loader />}
      {error && <Fail />}
      {!loading && campaigns && (
        <>
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
    </>
  );
};

CampaignListAffiliate.propTypes = {
  mode: PropTypes.string.isRequired,
};

export default CampaignListAffiliate;
