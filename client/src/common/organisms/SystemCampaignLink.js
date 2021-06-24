import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Code from '../atoms/Code';
import CopyButton from '../molecules/CopyButton';

const SystemCampaignLink = ({ campaign: { landingPage } }) => {
  const url = process.env.REACT_APP_SERVICE_BASE + landingPage;
  return (
    <CodeWrapper>
      <Code big>
        <a href={url} target="_blank" rel="noreferrer noopener">
          {url}
        </a>
      </Code>
      <CopyButton
        label="Copy link to clipboard"
        copyText={url}
        alertText="Link copied!"
      />
    </CodeWrapper>
  );
};

const CodeWrapper = styled.div`
  text-align: center;
  margin-top: 30px;
  ${Code} {
    display: block;
    margin-bottom: 15px;
  }
`;

SystemCampaignLink.propTypes = {
  campaign: PropTypes.object,
};

export default SystemCampaignLink;
