import Cookies from 'js-cookie';
import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';
axios.defaults.withCredentials = true;

const ProtectedRoute = () => {
    const token = Cookies.get("token");
     
    return token ? <Outlet/>  : <Navigate to="/login"/>

}

export default ProtectedRoute
