import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import { Controller } from 'react-hook-form';
import {
  DISCOUNT_CODE_EXTRA_LIFE,
  DISCOUNT_CODE_FIXED_AMOUNT,
  DISCOUNT_CODE_PERCENT,
} from '../../../util/constants';
import Select from '../../../common/molecules/Select';
import Input from '../../../common/molecules/Input';
import Message from '../../../common/atoms/Message';

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
  canEdit,
  allCodes,
}) => {
  const valueLabel = useMemo(() => getDiscountCodeValueLabel(type), [type]);

  // that's for un-editable codes
  useEffect(() => {
    if (!canEdit) {
      register({ name: `${namePrefix}.value`, value });
      register({ name: `${namePrefix}.code`, value: code });
    }
  });

  const validateDiscountCode = useCallback(
    discountCode => {
      if (allCodes.filter(c => c === discountCode).length > 1)
        return `Duplicate code`;
      if (!discountCode) return `Code is required`;
      if (discountCode.length < 4) return `Code length should be at least 4`;
      return true;
    },
    [allCodes],
  );

  const validateDiscountValue = useCallback(
    discountValue => {
      if (!discountValue) return `${valueLabel} is required`;
      if (Number.isNaN(Number(discountValue)))
        return `${valueLabel} should be a number`;
      if (
        type === DISCOUNT_CODE_EXTRA_LIFE &&
        !Number.isInteger(+discountValue)
      ) {
        return `${getDiscountCodeValueLabel(type)} should be integer`;
      }
      if (type === DISCOUNT_CODE_PERCENT && discountValue > 99) {
        return `${discountValue}%? So very gracious of you!`;
      }
      if (discountValue <= 0)
        return `${getDiscountCodeValueLabel(type)} should be > 0`;
      return true;
    },
    [valueLabel, type],
  );

  return (
    <DiscountWrap>
      <DiscountCodeInputWrapper>
        {canEdit ? (
          <DeleteCode
            data-tootik="Remove discount code"
            data-tootik-conf="right"
            onClick={removeSelf}
          >
            <DeleteIcon />
          </DeleteCode>
        ) : (
          <UsedCode>
            <CheckIcon />
          </UsedCode>
        )}

        <Line>
          <LineLabel>Type:</LineLabel>
          <Controller
            as={
              canEdit ? (
                <Select options={discountCodeOptions} value={type} />
              ) : (
                <Uneditable>
                  {discountCodeOptions.find(x => x.value === type)?.label}
                </Uneditable>
              )
            }
            name={`${namePrefix}.type`}
            control={control}
            defaultValue={type || DISCOUNT_CODE_PERCENT}
          />
        </Line>
        <Line>
          <LineLabel>{valueLabel}:</LineLabel>
          {canEdit ? (
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
          ) : (
            <Uneditable danger>{value}</Uneditable>
          )}
        </Line>
        <Line>
          <LineLabel>Code:</LineLabel>
          {canEdit ? (
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
          ) : (
            <Uneditable>{code}</Uneditable>
          )}
        </Line>
        {!canEdit && (
          <Message danger>
            Discount code used by an affiliate, thus non-editable
          </Message>
        )}
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
  canEdit: PropTypes.bool,
  error: PropTypes.object,
  allCodes: PropTypes.array,
  removeSelf: PropTypes.func,
};

const DiscountWrap = styled.div``;

const Uneditable = styled.span`
  font-weight: 600;
  padding-top: 7px;
  padding-right: 7px;
`;

const LeftIcon = styled.span`
  font-size: 0.875rem;
  transition: opacity 0.2s;
  position: absolute;
  left: 0;
  margin-top: 5px;
  opacity: 0.2;
`;

const DeleteCode = styled(LeftIcon)`
  color: ${props => props.theme.colors.red};
  cursor: pointer;

  svg {
    path {
      color: ${props => props.theme.colors.red};
    }
  }
`;

const UsedCode = styled(LeftIcon)`
  color: ${props => props.theme.colors.green};

  svg {
    path {
      color: ${props => props.theme.colors.green};
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
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: block;
    & > span {
      display: block;
      margin-bottom: 11px;
    }
  }
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
