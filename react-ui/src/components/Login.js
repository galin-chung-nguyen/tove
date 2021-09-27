import React, { Component, useCallback, useEffect } from "react";
import '../assets/css/Login.scss';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { useCookies } from 'react-cookie';
import { setUserInfoAction } from '../redux/actions';
import { useHistory, useLocation } from 'react-router-dom';
import Header from './Header';
import { GoogleLogin } from 'react-google-login';

let Login = () => {
    let state = useSelector(state => state);
    let dispatch = useDispatch();

    let history = useHistory()

    const [cookies, setCookie, removeCookie] = useCookies(['authToken']);

    const onFailure = async(data) => {
        console.log('Login with Google failed! ')
        console.log(data)
    }

    const responseGoogle = async (response) => {

        let userInfo = {
            accessToken: response.tokenId
        }

        /*googleId : response.profileObj.googleId,
        email : response.profileObj.email,
        name : response.profileObj.name,
        imageUrl : response.profileObj.imageUrl,*/
        try {
            let response = await fetch('/api/v1/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo)
            });

            let data = await response.json();

            console.log(data)

            switch(response.status){
                case 400 : throw new Error(data.msg);
                    break;
                case 201 :
                    console.log('Requesting to server succeeded!!!')
                    dispatch(setUserInfoAction(data));
                    history.push('/');
                    break;
                default: throw new Error(response);
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    }

const handleSubmit = (e) => {
    e.preventDefault()
}

return (
    <>
        <Header />
        <div className="App loginPage">
            <div className="auth-wrapper">
                <div className="auth-inner">
                    <form onSubmit={handleSubmit}>
                        <h3>Join Tove</h3>

                        <div className="form-group">
                            <GoogleLogin className="google-login-btn"
                                clientId="1072991183326-cjfcr6dm3p4voh9kncugef8epudqehjj.apps.googleusercontent.com"
                                buttonText="Continue with Google"
                                onSuccess={responseGoogle}
                                onFailure={onFailure}
                                cookiePolicy={'single_host_origin'}
                            />
                        </div>

                        <p className="forgot-password text-right">
                            Need <a href="#">help?</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </>
);
}

export default Login;