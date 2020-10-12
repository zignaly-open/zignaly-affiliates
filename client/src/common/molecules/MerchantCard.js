import PropTypes from 'prop-types';
import React from 'react';
import Box from '@material-ui/core/Box';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getSourceSet } from '../../util/image';
import ContentWrapper from '../atoms/ContentWrapper';

const MerchantCard = ({ merchant, imageSize = 60, content, onClick }) => {
  const profileRoute = `/merchant/${merchant._id}`;
  return (
    <MerchantInfo>
      <ContentWrapper onClick={onClick}>
        <Box flexDirection="row" display="flex">
          <Box flexShrink={1}>
            <img {...getSourceSet(merchant.logoUrl, imageSize)} alt="" />
          </Box>

          <Box flexGrow={1} display="flex" flexBasis={200} alignItems="center">
            <div style={{ minWidth: '200px' }}>
              <MerchantName>{merchant.name}</MerchantName>
              {content || <Link to={profileRoute}>View profile</Link>}
            </div>
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

const MerchantName = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: 0.78px;
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
`;
