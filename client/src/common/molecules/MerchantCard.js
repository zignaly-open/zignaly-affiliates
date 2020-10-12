import PropTypes from 'prop-types';
import React from 'react';
import ContentWrapper from "../atoms/ContentWrapper";
import Box from "@material-ui/core/Box";
import {getSrcSet} from "../../util/image";
import {Link, useHistory} from "react-router-dom";
import styled from "styled-components";

const MerchantCard = ({
                        merchant
}) => {
  const history = useHistory();
  let profileRoute = '/merchant/' + merchant._id;
  return (
    <MerchantInfo>
      <ContentWrapper onClick={() => history.push(profileRoute)}>
        <Box flexDirection="row" display={'flex'}>
          <Box flexShrink={1}>
            <img {...getSrcSet(merchant.logoUrl, 60)} />
          </Box>

          <Box flexGrow={1} display={"flex"} flexBasis={200} alignItems={'center'}>
            <div style={{minWidth: '200px'}}>
              <b>{merchant.name}</b>
              <br/>
              <Link to={profileRoute}>View profile</Link>
            </div>
          </Box>
        </Box>
      </ContentWrapper>
    </MerchantInfo>
  );
};

MerchantCard.propTypes = {
  merchant: PropTypes.object,
};

export default MerchantCard;


const MerchantInfo = styled.div`
  img {
    border-radius: 2px;
    margin-right: 20px;
  }
  b, a {
    line-height: 1.37;
  }
  
  b {
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 0.78px;
  }
`;
