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
    const duration = `for ${
      rewardDurationMonths === 0 || rewardDurationMonths === null
        ? 'Lifetime'
        : `${rewardDurationMonths} mo`
    }`;

    if (serviceType === SERVICE_TYPE_PROFIT_SHARING) {
      return `${rewardValue}% ${duration}`;
    }
    return (
      <>
        <Money value={rewardValue} /> per user {duration}
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
            {!rewardDurationMonths
              ? 'lifetime'
              : `first ${rewardDurationMonths} month${
                  rewardDurationMonths === 1 ? '' : 's'
                }`}
          </b>{' '}
          of the user
        </>
      ) : (
        <b>
          <Money value={rewardValue} />
          {rewardDurationMonths === 1 ? (
            ' per user'
          ) : (
            <>
              {' '}
              monthly during the{' '}
              <b>
                {!rewardDurationMonths
                  ? 'lifetime'
                  : `first ${rewardDurationMonths} month${
                      rewardDurationMonths === 1 ? '' : 's'
                    }`}
              </b>{' '}
              of the user
            </>
          )}
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
