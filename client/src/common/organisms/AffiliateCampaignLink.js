import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import Code from '../atoms/Code';
import CopyButton from '../molecules/CopyButton';
import Muted from '../atoms/Muted';
import Loader from '../Loader';
import { appContext } from '../../context/app';
import Title from '../atoms/Title';

const AffiliateCodeGenerator = ({
  campaign: {
    affiliate: { shortLink },
    _id,
  },
}) => {
  const { api } = useContext(appContext);
  const [linkToShow, setLinkToShow] = useState(shortLink);
  const [loading, setLoading] = useState(false);
  const generateAnotherLink = useCallback(async () => {
    setLoading(true);
    const { shortLink } = await api.post(
      `campaign/marketplace/${_id}/new-link`,
    );
    setLinkToShow(shortLink);
    setLoading(false);
  });
  const url = process.env.REACT_APP_REDIRECT_BASE + linkToShow;
  return loading ? (
    <Loader />
  ) : (
    <CodeWrapper>
      <Title>Promoting link</Title>
      <Code big>
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </Code>
      <CopyButton
        label="Copy link to clipboard"
        copyText={url}
        alertText="Link copied!"
      />
      <Muted block marginTop={15} small>
        Don't like the link?{' '}
        <a href="#" onClick={generateAnotherLink}>
          Generate a different one
        </a>
        . <br />
        Referrals that come through the old link will not be counted
      </Muted>
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

export default AffiliateCodeGenerator;
