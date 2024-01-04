import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import Header from '../components/Header';

const RegisterPage = () => {
    const {mode} = useParams();
    const [state, setState] = useState(mode == "signup" ? true : false);
    useEffect(()=>{
        setState(mode == "signup" ? true : false)
    }, [mode]);
  return (
    <div className = "login-body">
    <div className = "header-context">
        <Header />
    </div>
    <div className = "registerContentHolder">
        <div className = "registerCart w3-round-xlarge w3-border">
            <div className = "registerCartBtnHolder w3-row">
                <div onClick = {()=>setState(false)} className = 'registerCartBtn w3-col s6 w3-center register-btn-left'>
                    <p>Login</p>
                </div>
                <div onClick = {()=>setState(true)} className = 'registerCartBtn w3-col s6 w3-center register-btn-right'>
                    <p>Register</p>
                </div>
            </div>
            <div className = 'registerFormHolder'>
                {state ? <SignUpForm /> : <SignInForm />}
            </div>
        </div>
    </div>
    </div>
  )
}

export default RegisterPage