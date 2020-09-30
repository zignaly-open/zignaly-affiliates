import React, { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

export const SET_USER = 'set user';
export const CLEAR_USER = 'clear user';

const LOCAL_STORAGE_CACHE_NAME = 'user';

const initialState = {};
export const userStore = createContext(
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_CACHE_NAME)) || initialState,
);

const { Provider } = userStore;

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case SET_USER:
        return {
          ...state,
          ...action.data,
        };
      case CLEAR_USER:
        return {};
      default:
        throw new Error();
    }
  }, initialState);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CACHE_NAME, JSON.stringify(user));
  }, [user]);

  return <Provider value={{ user, dispatch }}>{children}</Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
