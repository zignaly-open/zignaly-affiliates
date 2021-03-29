import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { appContext } from '../../contexts/app';

const Logout = () => {
  const { clear } = useContext(appContext);
  useEffect(() => clear(), [clear]);
  return <Redirect to={{ pathname: '/' }} />;
};

export default Logout;
