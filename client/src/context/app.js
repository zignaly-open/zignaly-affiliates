import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';

export const SET_USER = 'set user';
export const CLEAR_USER = 'clear user';
export const SET_TOKEN = 'set token';

const LOCAL_STORAGE_CACHE_NAME = 'appState';

let initialState = {};
try {
  initialState =
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_CACHE_NAME)) || initialState;
} catch {
  // Do nothing
}

export const appContext = createContext(initialState);

const { Provider } = appContext;

export const AppProvider = ({ children }) => {
  const [appState, dispatch] = useReducer((state, action) => {
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

  const { user, token } = appState;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CACHE_NAME, JSON.stringify(appState));
  }, [appState]);

  const clear = useCallback(() => dispatch({ type: CLEAR_USER }), [dispatch]);
  const setToken = useCallback(data => dispatch({ type: SET_TOKEN, data }), [
    dispatch,
  ]);
  const setUser = useCallback(data => dispatch({ type: SET_USER, data }), [
    dispatch,
  ]);

  const api = useMemo(() => {
    const fetcher = httpMethod => (method, body) =>
      fetch((process.env.REACT_APP_API_BASE || '/api/v1/') + method, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        method: httpMethod,
        ...(body ? { body: JSON.stringify(body) } : {}),
      }).then(async response => {
        if (response.ok) {
          return response.json();
        }
        if (response.status === 401) clear();
        throw await response.json();
      });
    return {
      get: (method, query) =>
        fetcher('GET')(
          `${method}${
            query
              ? `?${new URLSearchParams(Object.entries(query)).toString()}`
              : ''
          }`,
        ),
      put: fetcher('PUT'),
      post: fetcher('POST'),
      delete: fetcher('DELETE'),
    };
  }, [clear, token]);

  return (
    <Provider
      value={{ api, user, setToken, setUser, clear, isAuthenticated: !!token }}
    >
      {children}
    </Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
