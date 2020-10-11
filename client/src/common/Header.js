import React, { useContext } from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../svg/logo.svg';
import { appContext } from '../context/app';
import {USER_MERCHANT} from "../util/constants";

const unauthenticatedRoutes = [
  { route: '/register', label: 'Register' },
  { route: '/login', label: 'Login' },
];

const merchantRoutes = [
  { route: '/', label: 'Dashboard' },
  { route: '/my/campaigns', label: 'Campaigns' },
  { route: '/profile', label: 'Profile' },
  { route: '/logout', label: 'Log out' },
];

const affiliateRoutes = [
  { route: '/', label: 'Dashboard' },
  { route: '/profile', label: 'Profile' },
  { route: '/logout', label: 'Log out' },
];

const Header = () => {
  const { isAuthenticated, user } = useContext(appContext);
  const location = useLocation();
  let routesToUse = unauthenticatedRoutes;
  if(isAuthenticated)
    routesToUse = user.role === USER_MERCHANT ? merchantRoutes : affiliateRoutes;

  return (
    <HeaderWrapper>
      <img src={Logo} alt="Zignaly" />
      <HeaderRightSide>
        {routesToUse.map(
          ({ route, label }) => (
            <Link
              key={route}
              className={classNames({ active: location.pathname === route })}
              to={route}
            >
              {label}
            </Link>
          ),
        )}
      </HeaderRightSide>
    </HeaderWrapper>
  );
};

export default Header;

const HeaderWrapper = styled.div`
  padding: 16px 32px;
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px 10px;
  }
  max-width: 960px;
  margin: 0 auto;
`;

const HeaderRightSide = styled.div`
  & > * {
    text-decoration: none;
    display: inline-block;
    margin-left: 30px;
    &:first-child {
      margin-left: 0;
    }
    font-size: 1.3125rem;
    line-height: 1.24;
    opacity: 0.5;
    letter-spacing: 0.8px;
    color: ${props => props.theme.colors.dark};
    transition: all 0.2s;
    &:hover,
    &.active {
      color: ${props => props.theme.colors.dark};
      opacity: 1;
    }
  }
`;
