import React, {useCallback, useMemo} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  REWARD_DURATION, REWARD_FIXED_AMOUNT,
  REWARD_PERCENT
} from "../../../util/constants";
import Select from "../../../common/molecules/Select";
import Input, {ErrorText} from "../../../common/molecules/Input";
import {Controller} from "react-hook-form";

const rewardOptions = [
  {label: '% from revenue', value: REWARD_PERCENT},
  {label: 'Fixed price', value: REWARD_FIXED_AMOUNT},
  {label: 'Duration, days', value: REWARD_DURATION}
]


const RewardInput = ({register, watch, control, errors }) => {
  const type = watch('rewardType');
  const valueLabel = useMemo(() => getRewardValueLabel(type), [type]);

  const validateRewardValue = useCallback((value) => {
    if(!value) return `Required`;
    if(isNaN(Number(value))) return `Should be a number`;
    if(type === REWARD_DURATION && !Number.isInteger(value)) return `Duration should be integer`;
    if(value < 0 && type === REWARD_DURATION) return `Duration should be >= 0 (0 for lifetime)`;
    if(value <= 0 && type !== REWARD_DURATION) return `Reward should be > 0`;
    return true;
  }, [valueLabel, type]);

  return (
    <RewardWrap>
      <Controller
        as={
          <Select options={rewardOptions} />
        }
        name={'rewardType'}
        control={control}
        defaultValue={REWARD_PERCENT}
      />

      <Input error={errors.rewardValue}
             inline
             min="0"
             placeholder={valueLabel}
             type="number"
             name={'rewardValue'}
             useRef={register({
               validate: validateRewardValue
             })}
             defaultValue={''}
      />
    </RewardWrap>
  );
};

function getRewardValueLabel(type) {
  return {
    [REWARD_DURATION]: 'Days (0 for lifetime)',
    [REWARD_FIXED_AMOUNT]: 'Amount',
    [REWARD_PERCENT]: 'Percent'
  }[type];
}

export default RewardInput;

RewardInput.propTypes = {
  error: PropTypes.object,
  useRef: PropTypes.any,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  inline: PropTypes.bool,
  isRequired: PropTypes.bool,
  putTitleAfter: PropTypes.bool,
};

const RewardWrap = styled.div`
  display: flex
`;
