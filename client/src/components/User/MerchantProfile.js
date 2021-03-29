import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Content from '../../common/molecules/Content';
import { appContext } from '../../contexts/app';
import Loader from '../../common/atoms/Loader';
import Fail from '../../common/molecules/Fail';
import MerchantCard from '../../common/molecules/MerchantCard';
import WallOfText from '../../common/molecules/WallOfText';
import { AffiliateCampaignListItem } from '../Campaigns/CampaignListElement';
import Title from '../../common/atoms/Title';
import ContentWrapper from '../../common/atoms/ContentWrapper';
import ContactUser from './ContactUser';

const MerchantProfile = () => {
  const { api } = useContext(appContext);
  const { id } = useParams();
  const history = useHistory();
  const { loading, error, value } = useAsync(
    async () =>
      Promise.all([
        api.get(`user/merchant/${id}`),
        api.get(`campaign/merchant/${id}`),
      ]),
    [],
  );

  const [merchant, campaigns] = value || [];

  return (
    <Content title={merchant ? `Merchant: ${merchant.name}` : 'Merchant'}>
      {loading && <Loader />}
      {error && <Fail />}
      {!loading && merchant && (
        <>
          <MerchantCard
            imageSize={200}
            content={
              <>
                <WallOfText text={merchant.aboutUs} title={null} />
              </>
            }
            merchant={merchant}
          />

          <Title>Contact {merchant.name}</Title>
          <ContentWrapper>
            <ContactUser user={merchant} />
          </ContentWrapper>
          <Title>Campaigns by {merchant.name}</Title>
          {campaigns.map(campaign => (
            <AffiliateCampaignListItem
              onClick={() => history.push(`/campaigns/${campaign._id}`)}
              key={campaign._id}
              campaign={campaign}
            />
          ))}
        </>
      )}
    </Content>
  );
};

export default MerchantProfile;
