import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from 'react-router-dom';
import { setUserInfoAction } from '../redux/actions';
import { useDispatch } from 'react-redux';

let Logout = ()=>{
    const [cookies,setCookie,removeCookie] = useCookies(['authToken']);
    let history = useHistory();
    let dispatch = useDispatch();

    useEffect(()=>{
        fetch('/api/v1/logout', { method: 'POST' })
        .then(res => {
            dispatch(setUserInfoAction({}));
            history.push('/')
        });
    },[]);

    return (<>
    
    </>);
}
export default Logout;