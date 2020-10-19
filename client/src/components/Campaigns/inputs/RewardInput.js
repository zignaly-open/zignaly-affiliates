import React, { useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SERVICE_TYPE_MONTHLY_FEE } from '../../../util/constants';
import Input from '../../../common/molecules/Input';

const RewardInput = ({ register, watch, errors }) => {
  const type = watch('serviceType');

  const validateRewardValue = useCallback(value => {
    if (!value) return `Required`;
    if (Number.isNaN(Number(value))) return `Should be a number`;
    if (value <= 0) return `Should be > 0`;
    return true;
  }, []);

  const validateRewardDuration = useCallback(
    value => {
      if (type === SERVICE_TYPE_MONTHLY_FEE) return true;
      if (!value) return `Required`;
      if (value < 0) return `Duration should be >= 0 (0 for lifetime)`;
      return true;
    },
    [type],
  );

  return (
    <RewardWrap>
      <Input
        error={errors.rewardValue}
        inline
        title={
          type === SERVICE_TYPE_MONTHLY_FEE ? 'Reward Amount' : 'Reward Percent'
        }
        min="0"
        placeholder={type === SERVICE_TYPE_MONTHLY_FEE ? 'Amount' : 'Percent'}
        type="number"
        name="rewardValue"
        useRef={register({
          validate: validateRewardValue,
        })}
        defaultValue=""
      />

      <Input
        hidden={type === SERVICE_TYPE_MONTHLY_FEE}
        title="Reward duration"
        error={errors.rewardDurationMonths}
        inline
        min="0"
        placeholder="Months (0 for lifetime)"
        type="number"
        name="rewardDurationMonths"
        useRef={register({
          validate: validateRewardDuration,
        })}
        defaultValue=""
      />

      <Input
        error={errors.rewardThreshold}
        inline
        title="Min payment threshold, $"
        min="0"
        placeholder="Threshold, $"
        type="number"
        name="rewardThreshold"
        useRef={register({
          validate: validateRewardValue,
        })}
        defaultValue=""
      />
    </RewardWrap>
  );
};

export default RewardInput;

RewardInput.propTypes = {
  watch: PropTypes.func,
  register: PropTypes.any,
  errors: PropTypes.object,
};

const RewardWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
