import React, { useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SERVICE_TYPE_MONTHLY_FEE } from '../../../util/constants';
import Input, { InputTitle } from '../../../common/molecules/Input';
import Money from '../../../common/atoms/Money';
import Digits from '../../../common/atoms/Digits';
import MoneyCentsInput from './MoneyCentsInput';

const RewardInput = ({
  register,
  watch,
  setValue,
  errors,
  campaign,
  canEdit = true,
}) => {
  const type = watch('serviceType');

  const validateRewardPercent = useCallback(value => {
    if (!value) return `Required`;
    if (Number.isNaN(Number(value))) return `Should be a number`;
    if (value <= 0) return `Should be > 0`;
    if (value >= 100) return `Should be < 100`;
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
    <RewardWrap canEdit={canEdit}>
      {canEdit ? (
        type === SERVICE_TYPE_MONTHLY_FEE ? (
          <MoneyCentsInput
            {...{ register, watch, setValue }}
            error={errors.rewardValue}
            inline
            title="Reward Amount, $"
            isRequired
            validate
            min="0"
            placeholder="Amount, $"
            type="number"
            name="rewardValue"
            defaultValue=""
          />
        ) : (
          <Input
            error={errors.rewardValue}
            inline
            title="Reward Percent"
            isRequired
            min="0"
            placeholder="Percent"
            type="number"
            name="rewardValue"
            useRef={register({
              validate: validateRewardPercent,
            })}
            defaultValue=""
          />
        )
      ) : (
        <InputTitle block marginBottom={18}>
          {type === SERVICE_TYPE_MONTHLY_FEE
            ? 'Reward Amount'
            : 'Reward Percent'}
          :{' '}
          <b>
            {type === SERVICE_TYPE_MONTHLY_FEE ? (
              <Money value={campaign.rewardValue} />
            ) : (
              <Digits suffix="%" value={campaign.rewardValue} />
            )}
          </b>
        </InputTitle>
      )}

      {canEdit ? (
        <Input
          title="Reward duration"
          error={errors.rewardDurationMonths}
          inline
          min="0"
          isRequired
          placeholder="Months (0 for lifetime)"
          type="number"
          name="rewardDurationMonths"
          useRef={register({
            validate: validateRewardDuration,
          })}
          defaultValue=""
        />
      ) : (
        type !== SERVICE_TYPE_MONTHLY_FEE && (
          <InputTitle block marginBottom={18}>
            Reward duration:{' '}
            <b>
              {campaign.rewardDurationMonths === 0
                ? 'Lifetime'
                : `${campaign.rewardDurationMonths} mo`}
            </b>
          </InputTitle>
        )
      )}

      {canEdit ? (
        <MoneyCentsInput
          {...{ register, watch, setValue }}
          error={errors.rewardThreshold}
          inline
          title="Min payment threshold, $"
          isRequired
          min="0"
          placeholder="Threshold, $"
          type="number"
          name="rewardThreshold"
          defaultValue=""
        />
      ) : (
        <InputTitle block marginBottom={18}>
          Min payment threshold:{' '}
          <b>
            <Money value={campaign.rewardThreshold} />
          </b>
        </InputTitle>
      )}
    </RewardWrap>
  );
};

export default RewardInput;

RewardInput.propTypes = {
  campaign: PropTypes.object,
  setValue: PropTypes.func,
  watch: PropTypes.func,
  register: PropTypes.any,
  canEdit: PropTypes.bool,
  errors: PropTypes.object,
};

const RewardWrap = styled.div`
  display: ${props => (props.canEdit ? 'flex' : 'block')};
  flex-wrap: wrap;
`;
