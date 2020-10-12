import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@material-ui/icons/Menu';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Drawer from '@material-ui/core/Drawer';
import Logo from '../svg/logo.svg';
import { appContext } from '../context/app';
import { USER_MERCHANT } from '../util/constants';

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
  { route: '/campaigns', label: 'Campaigns' },
  { route: '/profile', label: 'Profile' },
  { route: '/logout', label: 'Log out' },
];

const Header = () => {
  const { isAuthenticated, user } = useContext(appContext);
  const location = useLocation();
  let routesToUse = unauthenticatedRoutes;
  if (isAuthenticated)
    routesToUse =
      user.role === USER_MERCHANT ? merchantRoutes : affiliateRoutes;
  const theme = useContext(ThemeContext);
  const showFullNav = useMediaQuery(theme.breakpoints.up('sm'));
  const [isOpen, setOpen] = useState(false);
  const toggleDrawer = open => event => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(open);
  };
  return (
    <HeaderWrapper>
      <img src={Logo} alt="Zignaly" />
      {showFullNav ? (
        <HeaderRightSide>
          {routesToUse.map(({ route, label }) => (
            <Link
              key={route}
              className={classNames({ active: location.pathname === route })}
              to={route}
            >
              {label}
            </Link>
          ))}
        </HeaderRightSide>
      ) : (
        <>
          <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
            <List>
              {routesToUse.map(({ route, label }) => (
                <Link
                  key={route}
                  onClick={toggleDrawer(false)}
                  className={classNames({
                    active: location.pathname === route,
                  })}
                  to={route}
                >
                  {label}
                </Link>
              ))}
            </List>
          </Drawer>
          <OpenMenu onClick={toggleDrawer(true)}>
            <MenuIcon />
          </OpenMenu>
        </>
      )}
    </HeaderWrapper>
  );
};

export default Header;

const OpenMenu = styled.span`
  cursor: pointer;
  display: inline-block;
  padding: 7px 7px 5px;
  margin-top: -6px;

  svg path {
    fill: ${props => props.theme.colors.purple};
  }
`;

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

const List = styled.div`
  a,
  a:visited {
    display: block;
    min-width: 50vw;
    text-align: center;
    font-size: 1.1rem;
    padding: 25px 15px;
    text-decoration: none;
    &:hover {
      background-color: ${props => props.theme.colors.purple};
      color: ${props => props.theme.colors.white};
      text-decoration: none;
    }
    &:first-child {
      margin-top: 20px;
    }
  }
`;

const HeaderRightSide = styled.div`
  & > * {
    text-decoration: none;
    display: inline-block;
    &:first-child {
      margin-left: 0;
    }
    font-size: 1rem;
    line-height: 1.24;
    opacity: 0.5;
    letter-spacing: 0.8px;
    color: ${props => props.theme.colors.dark};
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    padding: 0 15px 10px;
    &:hover,
    &.active {
      border-color: ${props => props.theme.colors.purple};
      color: ${props => props.theme.colors.dark};
      opacity: 1;
    }
  }
`;
