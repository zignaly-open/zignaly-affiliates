import React, { useContext } from 'react';
import Title from '../../common/atoms/Title';
import DiscountCode from '../../common/molecules/DiscountCode';
import CampaignAffiliateViewDiscountCodesForm from './CampaignAffiliateViewDiscountCodesForm';
import { affiliateCampaignContext } from '../../context/affiliateCampaign';
import CampaignAffiliateViewDiscountCodesList from './CampaignAffiliateViewDiscountCodesList';
import Loader from '../../common/Loader';
import Ul from '../../common/atoms/Ul';

const CampaignAffiliateViewDiscountCodes = () => {
  const { campaign, loading } = useContext(affiliateCampaignContext);
  const { isAffiliate, discountCodes, affiliate } = campaign;

  return (
    <>
      <Title>Discount Codes</Title>
      {discountCodes?.length ? (
        <Ul>
          {discountCodes.map(code => (
            <li key={code._id}>
              <DiscountCode code={code} />
            </li>
          ))}
        </Ul>
      ) : (
        <p>This campaign does not offer discount codes</p>
      )}

      {isAffiliate && !loading && !!discountCodes?.length && (
        <>
          <Title>Generate Your Code</Title>
          <p>
            Why generate personalized discount code? Simple. If the referral
            uses your code, they will be attributed to you even if they have not
            used your link
          </p>
          <CampaignAffiliateViewDiscountCodesForm />

          {!!affiliate.discountCodes?.length && (
            <CampaignAffiliateViewDiscountCodesList />
          )}
        </>
      )}

      {isAffiliate && loading && <Loader />}
    </>
  );
};

CampaignAffiliateViewDiscountCodes.propTypes = {};

export default CampaignAffiliateViewDiscountCodes;
