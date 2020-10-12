import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/Delete';
import { Controller } from 'react-hook-form';
import {
  DISCOUNT_CODE_EXTRA_LIFE,
  DISCOUNT_CODE_FIXED_AMOUNT,
  DISCOUNT_CODE_PERCENT,
} from '../../../util/constants';
import Select from '../../../common/molecules/Select';
import Input from '../../../common/molecules/Input';

const discountCodeOptions = [
  { label: '% from payment', value: DISCOUNT_CODE_PERCENT },
  { label: 'Fixed amount from payment', value: DISCOUNT_CODE_FIXED_AMOUNT },
  { label: 'Extra duration', value: DISCOUNT_CODE_EXTRA_LIFE },
];

const DiscountCodeInput = ({
  code,
  register,
  namePrefix,
  control,
  type,
  value,
  error,
  removeSelf,
}) => {
  const valueLabel = useMemo(() => getDiscountCodeValueLabel(type), [type]);

  const validateDiscountCode = useCallback(discountCode => {
    if (!discountCode) return `Code is required not defined`;
    if (discountCode.length < 4) return `Code length should be at least 4`;
    return true;
  }, []);

  const validateDiscountValue = useCallback(
    discountValue => {
      if (!discountValue) return `${valueLabel} is required`;
      if (Number.isNaN(Number(discountValue)))
        return `${valueLabel} should be a number`;
      if (type === DISCOUNT_CODE_EXTRA_LIFE && !Number.isInteger(discountValue))
        return `${getDiscountCodeValueLabel(type)} should be integer`;
      if (discountValue <= 0)
        return `${getDiscountCodeValueLabel(type)} should be > 0`;
      return true;
    },
    [valueLabel, type],
  );

  return (
    <DiscountWrap>
      <DiscountCodeInputWrapper>
        <DeleteCode
          data-tootik="Remove discount code"
          data-tootik-conf="right"
          onClick={removeSelf}
        >
          <DeleteIcon />
        </DeleteCode>

        <Line>
          <LineLabel>Type:</LineLabel>
          <Controller
            as={<Select options={discountCodeOptions} />}
            name={`${namePrefix}.type`}
            control={control}
            defaultValue={type}
          />
        </Line>
        <Line>
          <LineLabel>{valueLabel}:</LineLabel>
          <Input
            error={error && error.value}
            inline
            min="0"
            placeholder={valueLabel}
            type="number"
            name={`${namePrefix}.value`}
            useRef={register({
              validate: validateDiscountValue,
            })}
            defaultValue={value}
          />
        </Line>
        <Line>
          <LineLabel>Code:</LineLabel>
          <Input
            error={error && error.code}
            inline
            type="text"
            name={`${namePrefix}.code`}
            useRef={register({
              validate: validateDiscountCode,
            })}
            defaultValue={code}
            placeholder="Code"
          />
        </Line>
      </DiscountCodeInputWrapper>
    </DiscountWrap>
  );
};

export const newDiscountCode = () => ({
  code: '',
  value: '',
  type: DISCOUNT_CODE_PERCENT,
});

function getDiscountCodeValueLabel(type) {
  return {
    [DISCOUNT_CODE_PERCENT]: 'Percent',
    [DISCOUNT_CODE_FIXED_AMOUNT]: 'Amount',
    [DISCOUNT_CODE_EXTRA_LIFE]: 'Extra days',
  }[type];
}

export default DiscountCodeInput;

DiscountCodeInput.propTypes = {
  code: PropTypes.string,
  register: PropTypes.func,
  namePrefix: PropTypes.string,
  control: PropTypes.any,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.object,
  removeSelf: PropTypes.func,
};

const DiscountWrap = styled.div``;

const DeleteCode = styled.a`
  font-size: 0.875rem;
  transition: opacity 0.2s;
  color: ${props => props.theme.colors.red};
  cursor: pointer;
  position: absolute;
  left: 0;
  margin-top: 5px;
  opacity: 0.2;
  cursor: pointer;

  svg {
    path {
      color: ${props => props.theme.colors.red};
    }
  }
`;

const DiscountCodeInputWrapper = styled.div`
  padding-left: 30px;
  position: relative;
  margin-bottom: 20px;
  display: inline-block;

  &:hover {
    ${DeleteCode} {
      opacity: 1;
    }
  }
`;

const Line = styled.div`
  margin-bottom: 10px;
  display: flex;
  label {
    margin-bottom: 0;
  }
`;

const LineLabel = styled.span`
  display: inline-block;
  min-width: 80px;
  padding-top: 7px;
  padding-right: 7px;
`;
