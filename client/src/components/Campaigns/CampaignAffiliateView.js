import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import ContentWrapper from '../../common/atoms/ContentWrapper';
import Title from '../../common/atoms/Title';
import WallOfText from '../../common/molecules/WallOfText';
import Input from '../../common/molecules/Input';
import ImagePreview from '../../common/atoms/ImagePreview';
import Reward from '../../common/atoms/Reward';
import AffiliateCodeGenerator from '../../common/organisms/AffiliateCampaignLink';
import CampaignAffiliateViewSidebar from './CampaignAffiliateViewSidebar';
import CampaignAffiliateViewDiscountCodes from './CampaignAffiliateViewDiscountCodes';
import { appContext } from '../../context/app';
import { affiliateCampaignContext } from '../../context/affiliateCampaign';
import Button from '../../common/Button';

const CampaignAffiliateView = ({ campaign, activate }) => {
  const theme = useTheme();
  const { api } = useContext(appContext);
  const { reloadCampaignSilently } = useContext(affiliateCampaignContext);
  const { isAffiliate, isArchived } = campaign;
  const bigScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [{ loading: unarchiving }, unarchive] = useAsyncFn(
    () =>
      api
        .post(`campaign/unarchive/${campaign._id}`)
        .then(reloadCampaignSilently),
    [campaign],
  );

  const merchant = (
    <Grid item xs={12} sm={5} md={4}>
      <Title>Merchant</Title>
      <CampaignAffiliateViewSidebar
        agreedToTerms={agreedToTerms}
        activate={activate}
        campaign={campaign}
      />
    </Grid>
  );
  return (
    <Grid container spacing={5}>
      {!bigScreen && merchant}
      <Grid item xs={12} sm={7} md={8}>
        <Title>Campaign information</Title>
        <ContentWrapper>
          <Reward campaign={campaign} short={false} />
          {isAffiliate &&
            (isArchived ? (
              <div>
                <p>
                  This campaign is archived. This campaign is hidden from your
                  active campaign list, but you continue to receive rewards
                  affiliates converted through your links.
                </p>
                <p>
                  <Button
                    link
                    compact
                    onClick={unarchiving ? undefined : unarchive}
                  >
                    {unarchiving ? 'Unarchiving... ' : 'Unarchive campaign'}
                  </Button>
                </p>
              </div>
            ) : (
              <AffiliateCodeGenerator campaign={campaign} />
            ))}
        </ContentWrapper>

        <Title>Description</Title>
        <ContentWrapper>
          <WallOfText
            text={campaign.description || campaign.shortDescription}
          />
        </ContentWrapper>

        {!process.env.REACT_APP_HIDE_DISCOUNT_CODES && isAffiliate && (
          <ContentWrapper>
            <CampaignAffiliateViewDiscountCodes campaign={campaign} />
          </ContentWrapper>
        )}

        {!!campaign.media && !!campaign.media.length && (
          <>
            <Title>Creatives</Title>
            <ContentWrapper>
              <Grid container spacing={5}>
                {campaign.media.map(({ filename, path }) => (
                  <Grid item key={filename} sm={6} md={4}>
                    <ImagePreview width="100%" height="auto" src={path} />
                  </Grid>
                ))}
              </Grid>
            </ContentWrapper>
          </>
        )}

        <Title>Terms and Conditions</Title>
        <ContentWrapper>
          <WallOfText
            id="terms-and-conditions"
            text={campaign.termsAndConditions}
          />
          <br />
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
      {bigScreen && merchant}
    </Grid>
  );
};

CampaignAffiliateView.propTypes = {
  campaign: PropTypes.object,
  activate: PropTypes.func,
};

export default CampaignAffiliateView;
