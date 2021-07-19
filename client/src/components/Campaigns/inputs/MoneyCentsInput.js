import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '../../../common/molecules/Input';

const MoneyCentsInput = ({ register, watch, setValue, name, ...rest }) => {
  const validate = useCallback(value => {
    if (!value) return `Required`;
    if (Number.isNaN(Number(value))) return `Should be a number`;
    if (value <= 0) return `Should be > 0`;
    if (!Number.isInteger(value))
      return `The value should be specified rounded to cents`;
    return true;
  }, []);

  register({ name }, { validate });

  return (
    <Input
      name={name}
      {...rest}
      step="0.01"
      onChange={e => setValue(name, Math.round(e.target.value * 100))}
      value={watch(name) / 100}
    />
  );
};

export default MoneyCentsInput;

MoneyCentsInput.propTypes = {
  campaign: PropTypes.object,
  setValue: PropTypes.func,
  name: PropTypes.string,
  watch: PropTypes.func,
  register: PropTypes.any,
  canEdit: PropTypes.bool,
  errors: PropTypes.object,
};
