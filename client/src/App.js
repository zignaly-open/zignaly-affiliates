import React, { useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import 'reset-css';
import 'tootik/css/tootik.min.css';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { AppProvider } from './context/app';
import NoMatchedRoute from './components/NoMatchedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/User/Login';
import Register from './components/User/Register';
import ResetPassword from './components/User/ResetPassword';
import Profile from './components/User/Profile';
import UserRestrictedRoute from './util/userRestrictedRoute';
import Header from './common/Header';
import TermsAndServices from './components/TermsAndServices';
import Logout from './components/User/Logout';
import ForgotPassword from './components/User/ForgotPassword';
import Campaigns from './components/Campaigns/Campaigns';
import MarketplaceCampaign from './components/Campaigns/MarketplaceCampaign';
import EditCampaign from './components/Campaigns/EditCampaign';
import { GlobalStyle, theme } from './theme';
import { USER_AFFILIATE, USER_MERCHANT } from './util/constants';
import Marketplace from './components/Campaigns/Marketplace';
import MerchantProfile from './components/User/MerchantProfile';

const AuthenticatedRoute = UserRestrictedRoute(
  (user, isAuthenticated) => isAuthenticated,
  '/login',
);
const UnauthenticatedRoute = UserRestrictedRoute(
  (user, isAuthenticated) => !isAuthenticated,
  '/',
);
const MerchantRoute = UserRestrictedRoute(
  (user, isAuthenticated) => isAuthenticated && user.role === USER_MERCHANT,
  '/',
);
const AffiliateRoute = UserRestrictedRoute(
  (user, isAuthenticated) => isAuthenticated && user.role === USER_AFFILIATE,
  '/',
);

const App = () => {
  const themeValue = useMemo(
    () =>
      createMuiTheme({
        ...theme,
      }),
    [],
  );
  return (
    <ThemeProvider theme={themeValue}>
      <MuiThemeProvider theme={themeValue}>
        <AppProvider>
          <>
            <GlobalStyle />
            <Router>
              <Header />

              <Switch>
                <UnauthenticatedRoute path="/login">
                  <Login />
                </UnauthenticatedRoute>
                <UnauthenticatedRoute path="/register">
                  <Register />
                </UnauthenticatedRoute>
                <UnauthenticatedRoute path="/reset/:token">
                  <ResetPassword />
                </UnauthenticatedRoute>
                <UnauthenticatedRoute path="/forgot-password">
                  <ForgotPassword />
                </UnauthenticatedRoute>
                <AuthenticatedRoute exact path="/">
                  <Dashboard />
                </AuthenticatedRoute>
                <AffiliateRoute path="/campaigns" exact>
                  <Marketplace />
                </AffiliateRoute>
                <AffiliateRoute path="/campaigns/:id">
                  <MarketplaceCampaign />
                </AffiliateRoute>
                <AffiliateRoute path="/merchant/:id">
                  <MerchantProfile />
                </AffiliateRoute>
                <MerchantRoute path="/my/campaigns" exact>
                  <Campaigns />
                </MerchantRoute>
                <MerchantRoute path="/my/campaigns/:id">
                  <EditCampaign />
                </MerchantRoute>
                <AuthenticatedRoute path="/profile">
                  <Profile />
                </AuthenticatedRoute>
                <AuthenticatedRoute path="/logout">
                  <Logout />
                </AuthenticatedRoute>
                <Route path="/tos">
                  <TermsAndServices />
                </Route>
                <Route path="*">
                  <NoMatchedRoute />
                </Route>
              </Switch>
            </Router>
          </>
        </AppProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
};

export default App;
