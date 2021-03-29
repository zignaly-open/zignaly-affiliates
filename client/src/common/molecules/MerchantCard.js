import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Box from '@material-ui/core/Box';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getSourceSet } from '../../util/image';
import ContentWrapper from '../atoms/ContentWrapper';
import { appContext } from '../../contexts/app';

const MerchantCard = ({ merchant, imageSize = 60, content, onClick }) => {
  const profileRoute = `/merchant/${merchant._id}`;
  const { user } = useContext(appContext);
  return (
    <MerchantInfo>
      <ContentWrapper onClick={onClick}>
        <Box flexDirection="row" display="flex">
          <Box flexShrink={1}>
            <img {...getSourceSet(merchant.logoUrl, imageSize)} alt="" />
          </Box>

          <Box flexGrow={1} display="flex" flexBasis={200} alignItems="center">
            <NameWrapper>
              <MerchantName big={imageSize > 100}>
                {merchant.name}
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                {merchant._id === user._id && <small> (it's&nbsp;you)</small>}
              </MerchantName>
              {content || <Link to={profileRoute}>View profile</Link>}
            </NameWrapper>
          </Box>
        </Box>
      </ContentWrapper>
    </MerchantInfo>
  );
};

MerchantCard.propTypes = {
  imageSize: PropTypes.number,
  onClick: PropTypes.func,
  merchant: PropTypes.object,
  content: PropTypes.element,
};

export default MerchantCard;

const NameWrapper = styled.div``;
const MerchantName = styled.div`
  font-weight: 600;
  font-size: ${props => (props.big ? 1.25 : 1.1)}rem;
  line-height: ${props => (props.big ? 1.25 : 1.1) * 1.2}rem;
  margin-bottom: ${props => (props.big ? 7 : 4)}px;
  letter-spacing: 0.78px;

  small {
    font-size: 0.875rem;
    font-weight: 300;
    opacity: 0.7;
  }
`;

const MerchantInfo = styled.div`
  img {
    border-radius: 2px;
    margin-right: 20px;
  }
  b,
  a {
    line-height: 1.37;
  }

  div {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
