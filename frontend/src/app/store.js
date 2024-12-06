//store.js
import { configureStore,  combineReducers} from "@reduxjs/toolkit";
import { persistStore,persistReducer,FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import  userReducer from './services/userSlice.js';
import authReducer from './services/authSlice.js';
import chatReducer from './services/chatSlice.js';
import llmReducer from './services/llmSlice.js';
import queryReducer from './services/querySlice.js';
import suggestionReducer from './services/suggestionSlice.js';
import dbReducer from './services/dbSlice.js';
import datafileReducer from './services/datafileSlice.js';
import datasourceReducer from './services/datasourceSlice.js';
import chartReducer from './services/chartSlice.js';

const rootReducer = combineReducers({
    auth:authReducer,
    user:userReducer,
    chat:chatReducer,
    llm:llmReducer,
    suggestion:suggestionReducer,
    query:queryReducer,
    db:dbReducer,
    datafile:datafileReducer,
    datasource:datasourceReducer,
    chart:chartReducer,
});

const persistConfig = {
    key:'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig,rootReducer);

export const store = configureStore({
    reducer : persistedReducer,
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
        serializableCheck:{
            ignoreActions:[FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER],
        },
    }),
});

export const persistor = persistStore(store);