import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  AccountCircle,
  ExitToApp,
  Money,
  LockOpen,
  Menu,
  List as ListIcon,
  PersonAdd,
} from '@material-ui/icons';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Drawer from '@material-ui/core/Drawer';
import Logo from '../../svg/logo.svg';
import { appContext } from '../../contexts/app';
import { USER_MERCHANT } from '../../util/constants';

const unauthenticatedRoutes = [
  { route: '/register', label: 'Register', icon: PersonAdd },
  { route: '/login', label: 'Login', icon: LockOpen },
];

const merchantRoutes = [
  { route: '/', label: 'Dashboard', icon: Home },
  { route: '/my/campaigns', label: 'Campaigns', icon: ListIcon },
  { route: '/payments', label: 'Payments', icon: Money },
  { route: '/profile', label: 'Profile', icon: AccountCircle },
  { route: '/logout', label: 'Log out', icon: ExitToApp },
];

const affiliateRoutes = [
  { route: '/', label: 'Dashboard', icon: Home },
  { route: '/campaigns', label: 'Campaigns', icon: ListIcon },
  { route: '/payments', label: 'Rewards', icon: Money },
  { route: '/profile', label: 'Profile', icon: AccountCircle },
  { route: '/logout', label: 'Log out', icon: ExitToApp },
];

const Header = () => {
  const { isAuthenticated, user } = useContext(appContext);
  const location = useLocation();
  let routesToUse = unauthenticatedRoutes;
  if (isAuthenticated)
    routesToUse =
      user.role === USER_MERCHANT ? merchantRoutes : affiliateRoutes;
  const theme = useContext(ThemeContext);
  const showFullNav = useMediaQuery(theme.breakpoints.up('md'));
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
      <Link to="/">
        <img src={Logo} alt="Zignaly" />
      </Link>
      {showFullNav ? (
        <HeaderRightSide>
          {routesToUse.map(({ route, label, icon: Icon }) => (
            <Link
              key={route}
              className={classNames({ active: location.pathname === route })}
              to={route}
            >
              {Icon && <Icon />}
              {label}
            </Link>
          ))}
        </HeaderRightSide>
      ) : (
        <>
          <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
            <List>
              {routesToUse.map(({ route, label, icon: Icon }) => (
                <Link
                  key={route}
                  onClick={toggleDrawer(false)}
                  className={classNames({
                    active: location.pathname === route,
                  })}
                  to={route}
                >
                  {Icon && <Icon />}
                  {label}
                </Link>
              ))}
            </List>
          </Drawer>
          <OpenMenu
            onClick={toggleDrawer(true)}
            role="button"
            onKeyPress={toggleDrawer(true)}
            tabindex="0"
          >
            <Menu />
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
    font-size: 1.1rem;
    padding: 15px 20px;
    text-decoration: none;
    transition: all 0.2s;
    &:hover {
      background-color: ${props => props.theme.colors.purple};
      color: ${props => props.theme.colors.white};
      text-decoration: none;
      svg * {
        fill: ${props => props.theme.colors.white};
      }
    }
    &:first-child {
      margin-top: 20px;
    }

    svg {
      margin-right: 7px;
      height: 1.5rem;
      margin-bottom: -0.4rem;
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
    padding: 0 15px 13px;
    &:hover,
    &.active {
      border-color: ${props => props.theme.colors.purple};
      color: ${props => props.theme.colors.dark};
      opacity: 1;
    }

    svg {
      margin-right: 7px;
      height: 1.5rem;
      margin-bottom: -0.5rem;
    }
  }
`;
