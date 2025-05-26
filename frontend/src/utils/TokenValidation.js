//TokenValidation.js
import {jwtDecode} from 'jwt-decode';
export const isTokenValid =(token)=>{
    try{
        const decode = jwtDecode(token);
        const currentTime = Date.now()/1000;
        return decode.exp>currentTime;
    }catch(error){
        console.error("Message : ",error);
        return false;
    }
}