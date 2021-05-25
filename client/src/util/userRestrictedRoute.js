import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { appContext } from '../contexts/app';

const RenderChildrenOrRedirect = ({ filter, children }) => {
  const { isAuthenticated, user } = useContext(appContext);
  const filterResult = filter(user, isAuthenticated);
  return filterResult === true ? (
    children
  ) : (
    <Redirect
      to={{
        pathname: filterResult,
      }}
    />
  );
};

RenderChildrenOrRedirect.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  filter: PropTypes.func,
};

const UserRestrictedRoute = filter => ({
  // problems with setting proptypes for this
  // eslint-disable-next-line react/prop-types
  children,
  ...rest
}) => (
  <Route {...rest}>
    <RenderChildrenOrRedirect filter={filter}>
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
