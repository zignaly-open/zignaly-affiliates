import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import {
  REWARD_FIXED_AMOUNT,
  REWARD_PERCENT,
} from '../../../util/constants';
import Select from '../../../common/molecules/Select';
import Input, {InputTitle} from '../../../common/molecules/Input';

const rewardOptions = [
  { label: '% from revenue', value: REWARD_PERCENT },
  { label: 'Fixed price', value: REWARD_FIXED_AMOUNT }
];

const RewardInput = ({ register, watch, control, errors }) => {
  const type = watch('rewardType');
  const valueLabel = useMemo(() => getRewardValueLabel(type), [type]);

  const validateRewardValue = useCallback(
    value => {
      if (!value) return `Required`;
      if (Number.isNaN(Number(value))) return `Should be a number`;
      if (value <= 0) return `Should be > 0`;
      return true;
    },
    [],
  );

  const validateRewardDuration = useCallback(
    value => {
      if(type !== REWARD_PERCENT) return true;
      if (!value) return `Required`;
      if (value < 0)
        return `Duration should be >= 0 (0 for lifetime)`;
      return true;
    },
    [type],
  );

  return (
    <RewardWrap>
      <Controller
        as={<Select options={rewardOptions} />}
        name="rewardType"
        title={"Type"}
        control={control}
        defaultValue={REWARD_PERCENT}
      />

      <Input
        error={errors.rewardValue}
        inline
        title={type === REWARD_FIXED_AMOUNT ? "Amount" : "Percent"}
        min="0"
        placeholder={valueLabel}
        type="number"
        name="rewardValue"
        useRef={register({
          validate: validateRewardValue,
        })}
        defaultValue=""
      />

      <Input
        hidden={type !== REWARD_PERCENT}
        title={"Reward duration"}
        error={errors.rewardDurationMonths}
        inline
        min="0"
        placeholder={'Months (0 for lifetime)'}
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
        title={"Min payment threshold, $"}
        min="0"
        placeholder={"Threshold, $"}
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

function getRewardValueLabel(type) {
  return {
    [REWARD_FIXED_AMOUNT]: 'Amount',
    [REWARD_PERCENT]: 'Percent',
  }[type];
}

export default RewardInput;

RewardInput.propTypes = {
  watch: PropTypes.func,
  register: PropTypes.any,
  control: PropTypes.any,
  errors: PropTypes.object,
};

const RewardWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
