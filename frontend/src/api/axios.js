//axios.js
import axios from "axios";
import {store} from '../app/store';
import {logout} from '../app/services/authSlice';

const api = axios.create({
    baseURL:"http://localhost:8000/",
    headers:{
        "Access-Control-Allow-Origin":"*",
        "Content-Type":"application/json",
    }

});

api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('access_token');
        if(token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },

    (error)=>{
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        if(error.response?.status === 401){
            store.dispatch(logout());
            localStorage.removeItem('access_token');
            window.dispatchEvent(new CustomEvent('authError'));
        }
        return Promise.reject(error);
    }
);

export default api;