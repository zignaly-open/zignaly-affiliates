import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { appContext } from '../context/app';

const RenderChildrenOrRedirect = ({ isAuthenticated: extectedAuthenticated, children, redirectRoute }) => {
  const { isAuthenticated } = useContext(appContext);
  return extectedAuthenticated === isAuthenticated ? (
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
  checker: PropTypes.func,
};

const UserRestrictedRoute = (isAuthenticated, redirectRoute) => ({
  // problems with setting proptypes for this
  // eslint-disable-next-line react/prop-types
  children,
  ...rest
}) => (
  <Route {...rest}>
    <RenderChildrenOrRedirect isAuthenticated={isAuthenticated} redirectRoute={redirectRoute}>
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
