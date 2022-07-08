import React from 'react';
import styled from 'styled-components';

const Maintenance = () => {
  return (
    <Description>
      We are redefining the affiliate site, it will be down for a while.
    </Description>
  );
};

export default Maintenance;

const Description = styled.div`
  text-align: center;
  line-height: 1.5rem;
  font-size: 1.2rem;
  margin: 52px auto 30px;
`;
