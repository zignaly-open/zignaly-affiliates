import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { userStore } from '../context/user';

const RenderChildrenOrRedirect = ({ checker, children, redirectRoute }) => {
  const { user } = useContext(userStore);
  return checker(user) ? (
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

const UserRestrictedRoute = (checker, redirectRoute) => ({
  // problems with setting proptypes for this
  // eslint-disable-next-line react/prop-types
  children,
  ...rest
}) => (
  <Route {...rest}>
    <RenderChildrenOrRedirect checker={checker} redirectRoute={redirectRoute}>
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
