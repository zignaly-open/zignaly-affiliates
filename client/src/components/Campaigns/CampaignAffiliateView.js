import React, { useContext, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import MerchantCard from '../../common/molecules/MerchantCard';
import ContentWrapper from '../../common/atoms/ContentWrapper';
import { appContext } from '../../context/app';
import Title from '../../common/atoms/Title';
import WallOfText from '../../common/molecules/WallOfText';
import Button from '../../common/Button';
import Input from '../../common/molecules/Input';
import ImagePreview from '../../common/atoms/ImagePreview';
import { formatSupportedMethods } from '../../common/atoms/Money';
import Reward from '../../common/atoms/Reward';
import Code from '../../common/atoms/Code';
import CopyButton from '../../common/molecules/CopyButton';
import { SERVICE_BASE } from '../../util/constants';

const CampaignAffiliateView = ({ campaign, activate }) => {
  const { user } = useContext(appContext);
  const theme = useTheme();
  const history = useHistory();
  const { merchant, isAffiliate } = campaign;
  const bigScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const paymentMethodsSupported = useMemo(
    () =>
      Object.entries(user.paymentCredentials || {}).some(
        ([method, value]) => value && merchant.paymentMethodSupport[method],
      ),
    [user, merchant],
  );

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const sidebar = (
    <Grid item xs={12} sm={4} md={4} lg={3}>
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
    </Grid>
  );

  const link = `${SERVICE_BASE}${campaign.landingPage}${
    campaign.landingPage.includes('?') ? '&' : '?'
  }cid=${campaign._id}&aff=${user._id}`;
  return (
    <Grid container spacing={5}>
      {!bigScreen && sidebar}
      <Grid item xs={12} sm={8} md={8} lg={9}>
        <ContentWrapper>
          <Reward campaign={campaign} short={false} />
          {isAffiliate && (
            <CodeWrapper>
              <Code big>
                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </Code>
              <CopyButton
                label="Copy link to clipboard"
                copyText={link}
                alertText="Link copied!"
              />
            </CodeWrapper>
          )}
        </ContentWrapper>
        <ContentWrapper>
          <WallOfText title="Description" text={campaign.description} />
        </ContentWrapper>

        <ContentWrapper>
          <Title>Creatives</Title>
          <Grid container spacing={5}>
            {campaign.media.map(({ filename, path }) => (
              <Grid item key={filename} sm={6} md={4}>
                <ImagePreview width="100%" height="auto" src={path} />
              </Grid>
            ))}
          </Grid>
        </ContentWrapper>

        <ContentWrapper>
          <WallOfText
            id="terms-and-conditions"
            title="Terms and Conditions"
            text={campaign.termsAndConditions}
          />
          <Input
            type="checkbox"
            title="Agree"
            data-tootik-conf="right"
            data-tootik={
              isAffiliate
                ? 'You have already agreed to Terms and Conditions'
                : undefined
            }
            checked={agreedToTerms || isAffiliate}
            onChange={() => !isAffiliate && setAgreedToTerms(v => !v)}
          />
        </ContentWrapper>
      </Grid>
      {bigScreen && sidebar}
    </Grid>
  );
};

const ActivateError = styled.div`
  font-size: 0.875rem;
  margin-top: 15px;
`;

const CodeWrapper = styled.div`
  text-align: center;
  margin-top: 30px;
  ${Code} {
    display: block;
    margin-bottom: 15px;
  }
`;

const ButtonWrapper = styled.div`
  margin: 35px 0 10px;
`;

CampaignAffiliateView.propTypes = {
  campaign: PropTypes.object,
  activate: PropTypes.func,
};

export default CampaignAffiliateView;
