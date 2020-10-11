import React, {useContext} from 'react';
import Content from "../../common/Content";
import {appContext} from "../../context/app";
import {
  REWARD_PERCENT,
  SERVICE_TYPE_MONTHLY_FEE,
  USER_MERCHANT
} from "../../util/constants";
import {useParams} from "react-router-dom";
import useAsync from "react-use/lib/useAsync";
import Loader from "../../common/Loader";
import Fail from "../../common/Fail";
import CampaignForm from "./CampaignForm";

const newCampaign = user => ({
  serviceType: SERVICE_TYPE_MONTHLY_FEE,
  rewardType: REWARD_PERCENT,
  termsAndConditions: user.termsAndConditions,
  discountCodes: []
})

const EditCampaign = () => {
  const { api, user } = useContext(appContext);
  const { id } = useParams();
  const isNew = id === 'new';
  const { loading, error, value: campaign } = useAsync(async () => isNew ? newCampaign(user) : api.get(`campaign/${id}`), [id]);

  return (
    <Content title={`${!isNew ?'Edit' : 'Create'} Campaign`} noHr>
      {loading && <Loader />}
      {error && <Fail />}
      {campaign && <CampaignForm campaign={campaign} />}
    </Content>
  );
};

export default EditCampaign;
