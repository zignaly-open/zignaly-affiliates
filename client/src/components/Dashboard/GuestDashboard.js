import React from 'react';
import styled from 'styled-components';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { useHistory } from 'react-router-dom';
import Content from '../../common/molecules/Content';
import Button from '../../common/atoms/Button';

const GuestDashboard = () => {
  const history = useHistory();
  return (
    <Content hideHr>
      <LoveZignalyTitle>
        I <FavoriteIcon /> Zignaly
      </LoveZignalyTitle>

      <Description>
        Welcome to the Affiliate platform. <br />
        Find people who will bring you more clients or earn money referring
        users
      </Description>
      <Buttons>
        <Button primary onClick={() => history.push('/login')}>
          Log in
        </Button>
        <Button primary onClick={() => history.push('/register')}>
          Create Account
        </Button>
      </Buttons>
    </Content>
  );
};

export default GuestDashboard;

const LoveZignalyTitle = styled.h1`
  font-size: 4rem;
  line-height: 4rem;
  font-weight: 800;
  text-align: center;
  text-shadow: 1px 1px #fff;
  margin: 20px auto 40px;
  text-transform: uppercase;
  svg {
    height: 4rem;
    width: 4rem;
    display: inline;
    vertical-align: bottom;
    fill: #f00;
    animation: heartbeat 1.4s infinite;
  }

  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    font-size: 3rem;
    line-height: 3rem;
    svg {
      height: 3rem;
      width: 3rem;
    }
  }

  @keyframes heartbeat {
    0% {
      transform: scale(0.75);
    }
    20% {
      transform: scale(1);
    }
    40% {
      transform: scale(0.75);
    }
    60% {
      transform: scale(1);
    }
    80% {
      transform: scale(0.75);
    }
    100% {
      transform: scale(0.75);
    }
  }
`;

const Buttons = styled.div`
  margin: 0 auto 25px;
  text-align: center;
  & > * {
    margin-bottom: 10px;
  }
`;

const Description = styled.div`
  text-align: center;
  line-height: 1.5rem;
  font-size: 1.2rem;
  max-width: 500px;
  margin: 0 auto 30px;
`;
