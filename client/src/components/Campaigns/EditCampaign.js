import React, { useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Lock from '@material-ui/icons/Lock';
import useAsync from 'react-use/lib/useAsync';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import { SERVICE_TYPE_MONTHLY_FEE } from '../../util/constants';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import CampaignForm from './CampaignForm';

const newCampaign = user => ({
  serviceType: SERVICE_TYPE_MONTHLY_FEE,
  termsAndConditions: user.termsAndConditions,
  discountCodes: [],
  media: [],
});

const EditCampaign = () => {
  const { api, user } = useContext(appContext);
  const isProfileFilled = useMemo(
    () => user.logoUrl && user.zignalyId && user.aboutUs && user.landingPage,
    [user],
  );
  const { id } = useParams();
  const isNew = id === 'new';
  const { loading, error, value: campaign } = useAsync(
    async () => (isNew ? newCampaign(user) : api.get(`campaign/my/${id}`)),
    [id],
  );

  return (
    <Content title={`${!isNew ? 'Edit' : 'Create'} Campaign`} noHr>
      {!isProfileFilled ? (
        <Fail
          icon={<Lock />}
          text={
            <>
              Your profile is incomplete. <br />
              Please, <Link to="/profile">complete it</Link>
            </>
          }
        />
      ) : (
        <>
          {loading && <Loader />}
          {error && <Fail />}
          {campaign && <CampaignForm campaign={campaign} />}
          {!loading && !error && !campaign && <Fail text="Not found" />}
        </>
      )}
    </Content>
  );
};

export default EditCampaign;
