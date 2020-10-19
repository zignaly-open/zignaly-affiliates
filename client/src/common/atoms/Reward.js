import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_PROFIT_SHARING,
} from '../../util/constants';
import Money, { formatSupportedMethods } from './Money';

const Reward = ({
  campaign: {
    serviceType,
    rewardDurationMonths,
    rewardValue,
    merchant,
    rewardThreshold,
  },
  short = true,
}) => {
  if (short) {
    if (serviceType === SERVICE_TYPE_PROFIT_SHARING)
      return `${rewardValue}% for ${
        rewardDurationMonths === 0 ? 'Lifetime' : `${rewardDurationMonths} mo`
      }`;
    return (
      <>
        <Money value={rewardValue} /> per user
      </>
    );
  }
  return (
    <RewardWrapper>
      <b>{SERVICE_TYPE_LABELS[serviceType]}</b> service paying{' '}
      {serviceType === SERVICE_TYPE_PROFIT_SHARING ? (
        <>
          <b>{rewardValue}% of the total revenue</b> during the{' '}
          <b>
            {rewardDurationMonths === 0
              ? 'lifetime'
              : `first ${rewardDurationMonths} month${
                  rewardDurationMonths === 1 ? '' : 's'
                }`}
          </b>{' '}
          of the user
        </>
      ) : (
        <b>
          <Money value={rewardValue} /> per user
        </b>
      )}
      . Payment is done by {formatSupportedMethods(merchant)} when at least{' '}
      <Money value={rewardThreshold || 0} /> is reached.
    </RewardWrapper>
  );
};

const RewardWrapper = styled.p`
  text-align: justify;
  b {
    font-weight: 600;
  }
`;

Reward.propTypes = {
  campaign: PropTypes.object,
  short: PropTypes.bool,
};

export default Reward;
