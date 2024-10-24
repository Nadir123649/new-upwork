// store.js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { chatReducer } from './reducers/chatReducer';
import { authReducer } from './reducers/authReducer';
import { onboardingReducer } from './reducers/onboardingReducer';
import { userReducer } from './reducers/userReducer';

// Individual persist configs
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: [
    'userId', 
    'email', 
    'isAuthorized', 
    'tempUserId',
    'chatResponseCount',
    'chatResponseLimit',
    'isUnlimited'
  ]
};

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isSchwabAuthenticated']
};

const onboardingPersistConfig = {
  key: 'onboarding',
  storage,
  whitelist: ['status']
};

// Combine reducers with individual persist configs
const rootReducer = combineReducers({
  chat: chatReducer, // Not persisted
  user: persistReducer(userPersistConfig, userReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
});

const middleware = [thunk];

const composeEnhancers = 
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

export const persistor = persistStore(store);
export default store;