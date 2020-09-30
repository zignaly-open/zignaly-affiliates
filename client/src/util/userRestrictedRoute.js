import React, {useContext} from "react";
import {userStore} from "../context/user";
import {Redirect, Route} from "react-router-dom";

const RenderChildrenOrRedirect = ({ checker, children, redirectRoute }) => {
  const {state: user} = useContext(userStore);
  return checker(user) ? children : (
    <Redirect
      to={{
        pathname: redirectRoute
      }}
    />
  );
};

const UserRestrictedRoute = (checker, redirectRoute) => ({ children, ...rest }) => {
  // const user = {};

  return (
    <Route {...rest}>
      <RenderChildrenOrRedirect checker={checker} redirectRoute={redirectRoute}>
        {children}
      </RenderChildrenOrRedirect>
    </Route>
  );
}

export default UserRestrictedRoute;
