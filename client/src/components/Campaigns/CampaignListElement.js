import React from "react";
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Box from "@material-ui/core/Box";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ContentWrapper from "../../common/atoms/ContentWrapper";
import {SERVICE_TYPE_LABELS} from "../../util/constants";
import { Link } from "react-router-dom";
import Reward from "../../common/atoms/Reward";

const CampaignListItem = ({ campaign }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <ContentWrapper>
      <Box flexDirection="row" display={matches ? 'flex' : null}>
        {/*<Box flexShrink={1}>Image</Box>*/}
        <Box flexGrow={1} style={{overflow: 'hidden'}}>
          <Box flexDirection="row" display={matches ? 'flex' : null}>
            <OverflowBox flexGrow={1}>
              <CampaignTitle>{campaign.name}</CampaignTitle>
            </OverflowBox>
            <Box flexBasis={100}>
              <EditLinkWrapper>
                <Link to={`/my/campaigns/${campaign._id}`}>Edit</Link>
              </EditLinkWrapper>
            </Box>
          </Box>
          <CampaignDescription>{campaign.shortDescription}</CampaignDescription>
          <CampaignFooter>
            <PublishStatus published={campaign.publish}>
              {campaign.publish ? <VisibilityIcon /> : <VisibilityOffIcon />}
              {campaign.publish ? 'Published' : 'Hidden'}
            </PublishStatus>
            <FooterElement>
              Type: <b>{SERVICE_TYPE_LABELS[campaign.serviceType]}</b>
            </FooterElement>
            <FooterElement>
              Discount codes: <b>{campaign.discountCodes?.length ? 'Yes' : 'No'}</b>
            </FooterElement>
            <FooterElement>
              Reward: <b><Reward campaign={campaign} /></b>
            </FooterElement>
          </CampaignFooter>
        </Box>
      </Box>

    </ContentWrapper>
  );
}

export default CampaignListItem;

const CampaignTitle = styled.h3`
  font-size: ${21/16}rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.24;
  letter-spacing: 0.8px;
  margin-bottom: 7px;
  ${props => props.theme.ellipsis};
`;

const CampaignFooter = styled.div`
  line-height: 1.67;
  svg {
    margin-bottom: ${-6/16}rem;
    margin-right: 4px;
  }
`;

const OverflowBox = styled(Box)`
  ${props => props.theme.ellipsis}
`;

const EditLinkWrapper = styled.div`
  text-align: right;
  margin-top: 2px;
  a, a:visited {
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

const PublishStatus = styled(FooterElement)`
  svg path {
    fill: ${props => props.theme.colors[props.published ? 'green' : 'semiDark']};
  }
  color: ${props => props.theme.colors[props.published ? 'green' : 'semiDark']};
`;

const CampaignDescription = styled.div`
  font-size: 1rem;
  line-height: 1.31;
  letter-spacing: 0.61px;
  margin-bottom: 7px;
  @media (min-width: ${props => props.theme.breakpoints.fablet}) {
    ${props => props.theme.ellipsis}
  }
`;
