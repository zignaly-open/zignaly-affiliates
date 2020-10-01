import React, {createContext, useCallback, useEffect, useMemo, useReducer} from 'react';
import PropTypes from 'prop-types';

export const SET_USER = 'set user';
export const CLEAR_USER = 'clear user';
export const SET_TOKEN = 'set token';

const LOCAL_STORAGE_CACHE_NAME = 'user';

let initialState = {};
try {
  initialState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CACHE_NAME));
} catch (e) {
  // Do nothing
}

export const appContext = createContext(initialState);

const { Provider } = appContext;

export const UserProvider = ({ children }) => {
  const [{ user, token }, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case SET_USER:
        return {
          ...state,
          user: action.data,
        };
      case SET_TOKEN:
        return {
          ...state,
          token: action.data,
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

  const clear = useCallback(() => dispatch({ type: CLEAR_USER }), [dispatch]);
  const setToken = useCallback(() => dispatch({ type: SET_TOKEN }), [dispatch]);
  const setUser = useCallback(() => dispatch({ type: SET_USER }), [dispatch]);

  const api = useMemo(() => {
    const fetcher = httpMethod =>
      (method, body) => fetch((process.env.REACT_APP_API_BASE || '/api/v1/') + method, {
        headers: {
          ...(token ? {Authorization: `Bearer ${token}`} : {}),
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        method: httpMethod,
        ...(body ? {body: JSON.stringify(body)} : {})
      })
        .then(response => {
          if(response.ok) {
            return response.json()
          } else {
            if(response.status === 401) clear();
            throw response.json();
          }
        })
    return {
      get: fetcher('GET'),
      put: fetcher('PUT'),
      post: fetcher('POST'),
      'delete': fetcher('DELETE')
    }
  }, [token])

  return <Provider value={{ api, user, setToken, setUser, clear, isAuthenticated: !!token }}>{children}</Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
