import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import CloseIcon from '@material-ui/icons/Close';
import ArchiveIcon from '@material-ui/icons/Archive';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Link } from 'react-router-dom';
import ContentWrapper from '../../common/atoms/ContentWrapper';
import { SERVICE_TYPE_LABELS } from '../../util/constants';
import Reward from '../../common/atoms/Reward';
import { getSourceSet } from '../../util/image';

export const MerchantCampaignListItem = ({ campaign, onClick }) => {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <ContentWrapper onClick={() => onClick(campaign)}>
      <MainBox flexDirection="row" display={wide ? 'flex' : null}>
        <Box flexGrow={1} style={{ overflow: 'hidden' }}>
          <Box flexDirection="row" display={wide ? 'flex' : null}>
            <OverflowBox flexGrow={1}>
              <CampaignTitle>{campaign.name}</CampaignTitle>
            </OverflowBox>
            <Box flexBasis={100}>
              <EditLinkWrapper>
                <Link to={`/my/campaigns/${campaign._id}`}>
                  Edit{wide ? '' : ' Campaign'}
                </Link>
              </EditLinkWrapper>
            </Box>
          </Box>
          <CampaignDescription>{campaign.shortDescription}</CampaignDescription>
          <CampaignFooter>
            <GreenGray green={campaign.publish}>
              {campaign.publish ? <VisibilityIcon /> : <VisibilityOffIcon />}
              {campaign.publish ? 'Published' : 'Hidden'}
            </GreenGray>
            <FooterElement>
              Type: <b>{SERVICE_TYPE_LABELS[campaign.serviceType]}</b>
            </FooterElement>
            <FooterElement>
              Discount codes:{' '}
              <b>{campaign.discountCodes?.length ? 'Yes' : 'No'}</b>
            </FooterElement>
            <FooterElement>
              Reward:{' '}
              <b>
                <Reward campaign={campaign} />
              </b>
            </FooterElement>
          </CampaignFooter>
        </Box>
      </MainBox>
    </ContentWrapper>
  );
};

export const AffiliateCampaignListItem = ({ campaign, onClick }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <ContentWrapper onClick={() => onClick(campaign)}>
      <MainBox flexDirection="row" display={matches ? 'flex' : null}>
        <Box flexShrink={1}>
          <CampaignImageWrapper>
            {matches ? (
              <img
                {...getSourceSet(campaign.merchant.logoUrl, 120)}
                alt={campaign.name}
              />
            ) : (
              <img
                {...getSourceSet(campaign.merchant.logoUrl, 200)}
                alt={campaign.name}
              />
            )}
          </CampaignImageWrapper>
        </Box>

        <OverflowBox flexGrow={1} display="flex" alignItems="center">
          <Content>
            <OverflowBox flexGrow={1}>
              <CampaignTitle>{campaign.name}</CampaignTitle>
            </OverflowBox>
            <CampaignDescription>
              {campaign.shortDescription}
            </CampaignDescription>
            <CampaignFooter>
              <GreenGray green={campaign.isAffiliate && !campaign.isArchived}>
                {campaign.isAffiliate && !campaign.isArchived && <CheckIcon />}
                {campaign.isAffiliate && campaign.isArchived && <ArchiveIcon />}
                {!campaign.isAffiliate && campaign.isArchived && <CloseIcon />}
                {campaign.isAffiliate && !campaign.isArchived && 'Active affiliate'}
                {!campaign.isAffiliate && !campaign.isArchived && 'Not an affiliate'}
                {campaign.isArchived && 'Archived'}
              </GreenGray>
              {!process.env.REACT_APP_HIDE_DISCOUNT_CODES && (
                <GreenGray green={campaign.discountCodesCount}>
                  {campaign.discountCodesCount > 0 ? (
                    <LocalOfferIcon />
                  ) : (
                    <CloseIcon />
                  )}
                  {campaign.discountCodesCount > 0
                    ? 'Offers discount codes'
                    : 'No discount codes'}
                </GreenGray>
              )}
              <FooterElement>
                Reward:{' '}
                <b>
                  <Reward campaign={campaign} />
                </b>
              </FooterElement>
            </CampaignFooter>
          </Content>
        </OverflowBox>
      </MainBox>
    </ContentWrapper>
  );
};

const CampaignTitle = styled.h3`
  font-size: ${21 / 16}rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.24;
  letter-spacing: 0.8px;
  margin-bottom: 7px;
  ${props => props.theme.ellipsis};
`;

const CampaignImageWrapper = styled.div`
  img {
    width: 120px;
    border-radius: 3px;
    margin-right: 20px;
    height: 120px;
    object-fit: cover;
  }

  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    margin-bottom: 20px;

    img {
      width: 200px;
      height: 200px;
    }
  }
`;

const CampaignFooter = styled.div`
  line-height: 1.67;
  svg {
    margin-bottom: ${-6 / 16}rem;
    margin-right: 4px;
  }
`;

const MainBox = styled(Box)``;

const Content = styled.div`
  width: 100%;
`;

const OverflowBox = styled(Box)`
  ${props => props.theme.ellipsis}
`;

const EditLinkWrapper = styled.div`
  text-align: right;
  margin-top: 2px;

  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    text-align: left;
    margin-bottom: 7px;
    margin-top: 0;
  }

  a,
  a:visited {
    color: ${props => props.theme.colors.violet};
  }
`;

const FooterElement = styled.span`
  b {
    font-weight: 600;
  }
  &:after {
    content: '';
    position: relative;
    width: 3px;
    margin-left: 7px;
    margin-right: 7px;
    height: 3px;
    display: inline-block;
    background-color: ${props => props.theme.colors.semiDark};
    border-radius: 50%;
    top: -0.2rem;
  }
  &:last-child {
    &:after {
      display: none;
    }
  }
  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    display: block;
    &:after {
      display: none;
    }
  }
`;

const GreenGray = styled(FooterElement)`
  svg path {
    fill: ${props => props.theme.colors[props.green ? 'green' : 'semiDark']};
  }
  color: ${props => props.theme.colors[props.green ? 'green' : 'semiDark']};
`;

const CampaignDescription = styled.div`
  font-size: 1rem;
  line-height: 1.31;
  letter-spacing: 0.61px;
  margin-bottom: 7px;
  ${props => props.theme.ellipsis};
`;

MerchantCampaignListItem.propTypes = {
  campaign: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

AffiliateCampaignListItem.propTypes = {
  campaign: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
