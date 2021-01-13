import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Code from '../atoms/Code';
import CopyButton from '../molecules/CopyButton';
import Muted from '../atoms/Muted';
import Loader from '../Loader';
import { appContext } from '../../context/app';
import Title from '../atoms/Title';
import Button from '../Button';
import useAsyncFn from "react-use/lib/useAsyncFn";
import {affiliateCampaignContext} from "../../context/affiliateCampaign";

const AffiliateCodeGenerator = ({
  campaign: {
    affiliate: { shortLink },
    _id,
  },
}) => {
  const { api } = useContext(appContext);
  const { reloadCampaignSilently } = useContext(affiliateCampaignContext);
  const [linkToShow, setLinkToShow] = useState(shortLink);
  const [loading, setLoading] = useState(false);
  const generateAnotherLink = useCallback(async () => {
    setLoading(true);
    const { shortLink: newLink } = await api.post(
      `campaign/marketplace/${_id}/new-link`,
    );
    setLinkToShow(newLink);
    setLoading(false);
  }, [_id, api]);

  const [{loading: archiving}, archive] = useAsyncFn(() => api.post(`campaign/archive/${_id}`).then(reloadCampaignSilently), [_id])

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
        Don&apos;t like the link?{' '}
        <Button link onClick={generateAnotherLink}>
          Generate a different one
        </Button>
        . <br />
        Referrals that come through the old link will not be counted.
        <br />

        <div data-tootik-conf="multiline"
             data-tootik="You'll continue to receive rewards for affiliates converted through your links">
          <Button link compact onClick={archiving ? undefined : archive}>
            {archiving ? 'Archiving... ' : 'Archive campaign' }
          </Button>
          {' '}to hide it from your list of active campaigns.
        </div>
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

AffiliateCodeGenerator.propTypes = {
  campaign: PropTypes.object,
};

export default AffiliateCodeGenerator;
