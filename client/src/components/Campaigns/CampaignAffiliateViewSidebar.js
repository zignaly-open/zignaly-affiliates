import React, { useContext, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MerchantCard from '../../common/molecules/MerchantCard';
import { appContext } from '../../context/app';
import Button from '../../common/Button';
import { formatSupportedMethods } from '../../common/atoms/Money';

const CampaignAffiliateViewSidebar = ({
  campaign,
  activate,
  agreedToTerms,
}) => {
  const { user } = useContext(appContext);
  const history = useHistory();
  const { merchant, isAffiliate } = campaign;
  const paymentMethodsSupported = useMemo(
    () =>
      Object.entries(user.paymentCredentials || {}).some(
        ([method, value]) => value && merchant.paymentMethodSupport[method],
      ),
    [user, merchant],
  );

  return (
    <>
      <MerchantCard
        onClick={() => history.push(`/merchant/${merchant._id}`)}
        merchant={merchant}
      />

      {!isAffiliate && (
        <ButtonWrapper style={{ textAlign: 'center' }}>
          <Button
            primary
            minWidth={180}
            onClick={activate}
            disabled={!agreedToTerms || !paymentMethodsSupported}
          >
            Activate Campaign
          </Button>
          {!agreedToTerms && (
            <ActivateError>
              Please agree to{' '}
              <a href="#terms-and-conditions">Terms and Conditions</a> first
            </ActivateError>
          )}
          {!paymentMethodsSupported && (
            <ActivateError>
              To work with this Merchant, <Link to="/profile">configure</Link>{' '}
              {formatSupportedMethods(merchant)}
            </ActivateError>
          )}
        </ButtonWrapper>
      )}
    </>
  );
};

const ActivateError = styled.div`
  font-size: 0.875rem;
  margin-top: 15px;
`;

const ButtonWrapper = styled.div`
  margin: 35px 0 10px;
`;

CampaignAffiliateViewSidebar.propTypes = {
  campaign: PropTypes.object,
  agreedToTerms: PropTypes.bool,
  activate: PropTypes.func,
};

export default CampaignAffiliateViewSidebar;
