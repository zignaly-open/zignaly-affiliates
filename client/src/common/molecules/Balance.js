import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Balance = ({
  value,
  label,
  color,
  precision = 2,
  currencyLabel = '$',
  big,
}) => (
  <BalanceWrapper color={color}>
    <BalanceLabel>{label}</BalanceLabel>
    <BalanceValue big={big}>
      {currencyLabel}
      {Number(value).toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })}
    </BalanceValue>
  </BalanceWrapper>
);

export default Balance;

const BalanceWrapper = styled.div`
  min-width: 160px;
  display: inline-block;
  line-height: 1.5;
  letter-spacing: 0.53px;
  margin-right: 20px;
  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    margin-bottom: 12px;
  }
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.dark};
`;

const BalanceValue = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: ${props => (props.big ? 1.75 : 0.875)}rem;
  font-weight: 500;
  color: ${props =>
    (props.color && props.theme.colors[props.color]) ||
    props.theme.colors.dark};
`;

Balance.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  color: PropTypes.string,
  precision: PropTypes.number,
  currencyLabel: PropTypes.string,
  big: PropTypes.bool,
};
