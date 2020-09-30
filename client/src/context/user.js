import React, {createContext, useEffect, useReducer} from 'react';

export const SET_USER = 'set user';
export const CLEAR_USER = 'clear user';

const LOCAL_STORAGE_CACHE_NAME = "user";

const initialState = {};
export const userStore = createContext(JSON.parse(localStorage.getItem(LOCAL_STORAGE_CACHE_NAME)) || initialState);

const { Provider } = userStore;

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case SET_USER:
        return {
          ...state,
          ...action.data
        };
      case CLEAR_USER:
        return {};
      default:
        throw new Error();
    }
  }, initialState);


  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CACHE_NAME, JSON.stringify(state));
  }, [state]);


  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};
