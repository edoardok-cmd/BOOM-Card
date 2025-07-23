import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import cardReducer from './slices/cardSlice';
import transactionReducer from './slices/transactionSlice';
import notificationReducer from './slices/notificationSlice';
import settingsReducer from './slices/settingsSlice';
import analyticsReducer from './slices/analyticsSlice';
import merchantReducer from './slices/merchantSlice';
import rewardsReducer from './slices/rewardsSlice';
import securityReducer from './slices/securitySlice';
import { createLogger } from 'redux-logger';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';

// Types
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  user: ReturnType<typeof userReducer>;
  card: ReturnType<typeof cardReducer>;
  transaction: ReturnType<typeof transactionReducer>;
  notification: ReturnType<typeof notificationReducer>;
  settings: ReturnType<typeof settingsReducer>;
  analytics: ReturnType<typeof analyticsReducer>;
  merchant: ReturnType<typeof merchantReducer>;
  rewards: ReturnType<typeof rewardsReducer>;
  security: ReturnType<typeof securityReducer>;
}

export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Constants
const PERSIST_KEY = 'boom-card-root';
const PERSIST_VERSION = 1;
const ENCRYPTION_SECRET = process.env.NEXT_PUBLIC_PERSIST_SECRET || 'boom-card-secret-key';

// Persist configuration
const persistConfig = {
  key: PERSIST_KEY,
  version: PERSIST_VERSION,
  storage,
  whitelist: ['auth', 'user', 'settings', 'card'],
  transforms: [
    encryptTransform({
      secretKey: ENCRYPTION_SECRET,
      onError: (error) => {
        console.error('Encryption error:', error);
      },
    }),
  ],
};

// Logger configuration
const loggerConfig = {
  diff: true,
  collapsed: true,
  duration: true,
  timestamp: true,
  level: {
    prevState: false,
    action: 'info',
    nextState: 'info',
    error: 'error',
  },
};

Based on the context that this is Part 2 of a Redux store setup for BOOM Card, here's the main implementation following typical Redux patterns:

// Store configuration
const rootReducer = combineReducers({
  auth: authReducer,
  cards: cardsReducer,
  transactions: transactionsReducer,
  user: userReducer,
  ui: uiReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  analytics: analyticsReducer
});

// Middleware configuration
const middlewares: Middleware[] = [
  thunk,
  apiMiddleware,
  errorMiddleware,
  analyticsMiddleware
];

if (process.env.NODE_ENV === 'development') {
  middlewares.push(logger);
}

// Persist configuration
  key: 'boom-card-root',
  storage,
  whitelist: ['auth', 'user', 'settings'],
  transforms: [encryptTransform],
  version: 1,
  migrate: createMigrate(migrations, { debug: true })
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// API Middleware
const apiMiddleware: Middleware = (store) => (next) => async (action: any) => {
  if (!action.meta?.api) {
    return next(action);
  }

  const { endpoint, method = 'GET', body, headers = {} } = action.meta.api;
  const state = store.getState();
  const token = state.auth.token;

  store.dispatch({ type: `${action.type}_REQUEST` });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    store.dispatch({
      type: `${action.type}_SUCCESS`,
      payload: data,
      meta: { ...action.meta, response });

    return data;
  } catch (error) {
    store.dispatch({
      type: `${action.type}_FAILURE`,
      error: error.message,
      meta: action.meta
    });
    throw error;
  };

// Error Middleware
const errorMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (action.error) {
    console.error('Error in action:', action.type, action.error);
    
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: action.error,
        timestamp: new Date().toISOString()
      });
  }

  return next(action);
};

// Analytics Middleware
const analyticsMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (action.meta?.analytics) {
    const { event, properties } = action.meta.analytics;
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track(event, {
        ...properties,
        userId: state.user.id,
        timestamp: new Date().toISOString()
      });
    }

  return next(action);
};

// Store factory function
export function configureStore(preloadedState?: Partial<RootState>) {
  const store = createStore(
    persistedReducer,
    preloadedState,
    composeWithDevTools(
      applyMiddleware(...middlewares)
    )
  );

  const persistor = persistStore(store);

  // Hot module replacement
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(persistedReducer);
    });
  }

  return { store, persistor };
}

// Create store instance
const { store, persistor } = configureStore();

// Store subscriptions
store.subscribe(() => {
  
  // Update document title based on notifications
  const unreadNotifications = state.notifications.items.filter(n => !n.read).length;
  if (unreadNotifications > 0) {
    document.title = `(${unreadNotifications}) BOOM Card`;
  } else {
    document.title = 'BOOM Card';
  });

// Rehydration callbacks
export const onRehydrate = (callback: () => void) => {
  persistor.subscribe(() => {
    const { bootstrapped } = persistor.getState();
    if (bootstrapped) {
      callback();
    });
};

// Selectors
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export store and persistor
export { store, persistor };
export default store;

}
}
}
}
}
