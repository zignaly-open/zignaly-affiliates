import React, {useContext, useEffect} from 'react';
import {Redirect} from "react-router-dom";
import {CLEAR_USER, userStore} from "../context/user";

const Logout = () => {
  const { dispatch } = useContext(userStore);
  useEffect(() => dispatch({type: CLEAR_USER }), []);
  return <Redirect to={{ pathname: '/' }} />;
};

export default Logout;
