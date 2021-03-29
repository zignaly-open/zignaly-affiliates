import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NoMatchedRoute from './components/NoMatchedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/User/Login';
import Register from './components/User/Register';
import ResetPassword from './components/User/ResetPassword';
import Profile from './components/User/Profile';
import UserRestrictedRoute from './util/userRestrictedRoute';
import Header from './common/organisms/Header';
import Logout from './components/User/Logout';
import ForgotPassword from './components/User/ForgotPassword';
import Campaigns from './components/Campaigns/Campaigns';
import MarketplaceCampaign from './components/Campaigns/MarketplaceCampaign';
import EditCampaign from './components/Campaigns/EditCampaign';
import { USER_AFFILIATE, USER_MERCHANT } from './util/constants';
import Marketplace from './components/Campaigns/Marketplace';
import MerchantProfile from './components/User/MerchantProfile';
import Payments from './components/Payments/Payments';
import RootProvider from './RootProvider';
import { theme } from './theme';

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
  '/login',
);
const AffiliateRoute = UserRestrictedRoute(
  (user, isAuthenticated) => isAuthenticated && user.role === USER_AFFILIATE,
  '/login',
);

const App = () => (
  <RootProvider theme={theme}>
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
        <Route exact path="/">
          <Dashboard />
        </Route>
        <AffiliateRoute path="/campaigns" exact>
          <Marketplace />
        </AffiliateRoute>
        <AuthenticatedRoute path="/payments" exact>
          <Payments />
        </AuthenticatedRoute>
        <AuthenticatedRoute path="/campaigns/:id">
          <MarketplaceCampaign />
        </AuthenticatedRoute>
        <Route path="/merchant/:id">
          <MerchantProfile />
        </Route>
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
        <Route path="*">
          <NoMatchedRoute />
        </Route>
      </Switch>
    </Router>
  </RootProvider>
);

export default App;
