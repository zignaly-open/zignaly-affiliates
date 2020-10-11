import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {REWARD_PERCENT} from "../../util/constants";
import Money from "./Money";

const Reward = ({ campaign: { rewardType, rewardDurationMonths, rewardValue } }) => {
  if(rewardType === REWARD_PERCENT)
    return `${rewardValue}% for ${rewardDurationMonths === 0 ? 'Lifetime' : `${rewardDurationMonths} mo`}`;
  else
    return <><Money value={rewardValue} /> per user</>;
}

Reward.propTypes = {
  campaign: PropTypes.object
};

export default Reward;
