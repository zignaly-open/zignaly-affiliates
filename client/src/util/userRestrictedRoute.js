import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { appContext } from '../context/app';

const RenderChildrenOrRedirect = ({ filter, children, redirectRoute }) => {
  const { isAuthenticated, user } = useContext(appContext);
  return filter(user, isAuthenticated) ? (
    children
  ) : (
    <Redirect
      to={{
        pathname: redirectRoute,
      }}
    />
  );
};

RenderChildrenOrRedirect.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  redirectRoute: PropTypes.string,
  filter: PropTypes.func,
};

const UserRestrictedRoute = (filter, redirectRoute) => ({
  // problems with setting proptypes for this
  // eslint-disable-next-line react/prop-types
  children,
  ...rest
}) => (
  <Route {...rest}>
    <RenderChildrenOrRedirect filter={filter} redirectRoute={redirectRoute}>
      {children}
    </RenderChildrenOrRedirect>
  </Route>
);

UserRestrictedRoute.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default UserRestrictedRoute;
