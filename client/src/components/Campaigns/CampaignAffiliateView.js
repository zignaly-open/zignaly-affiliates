import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import ContentWrapper from '../../common/atoms/ContentWrapper';
import Title from '../../common/atoms/Title';
import WallOfText from '../../common/molecules/WallOfText';
import Input from '../../common/molecules/Input';
import ImagePreview from '../../common/atoms/ImagePreview';
import Reward from '../../common/atoms/Reward';
import AffiliateCodeGenerator from '../../common/organisms/AffiliateCampaignLink';
import CampaignAffiliateViewSidebar from './CampaignAffiliateViewSidebar';
import CampaignAffiliateViewDiscountCodes from './CampaignAffiliateViewDiscountCodes';

const CampaignAffiliateView = ({ campaign, activate }) => {
  const theme = useTheme();
  const { isAffiliate } = campaign;
  const bigScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <Grid container spacing={5}>
      {!bigScreen && (
        <Grid item xs={12} sm={4} md={4} lg={3}>
          <CampaignAffiliateViewSidebar
            agreedToTerms={agreedToTerms}
            activate={activate}
            campaign={campaign}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={8} md={8} lg={9}>
        <ContentWrapper>
          <Reward campaign={campaign} short={false} />
          {isAffiliate && <AffiliateCodeGenerator campaign={campaign} />}
        </ContentWrapper>

        <ContentWrapper>
          <WallOfText title="Description" text={campaign.description} />
        </ContentWrapper>

        {isAffiliate && (
          <ContentWrapper>
            <CampaignAffiliateViewDiscountCodes campaign={campaign} />
          </ContentWrapper>
        )}

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
      {bigScreen && (
        <Grid item xs={12} sm={4} md={4} lg={3}>
          <CampaignAffiliateViewSidebar
            agreedToTerms={agreedToTerms}
            activate={activate}
            campaign={campaign}
          />
        </Grid>
      )}
    </Grid>
  );
};

CampaignAffiliateView.propTypes = {
  campaign: PropTypes.object,
  activate: PropTypes.func,
};

export default CampaignAffiliateView;
