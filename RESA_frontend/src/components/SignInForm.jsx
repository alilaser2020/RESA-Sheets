import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { Php } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const Alert = React.forwardRef (function Alert(props, ref,) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SignInForm = () => {

  const inputStyle = {fontSize : "10rem"};

  const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};

  const navigate = useNavigate();

  //Username:
  const [usernameValue, setUsernameValue] = useState();
  const [usernameError, setUsernameError] = useState(false);

  //Password:
  const [passwordValue, setPasswordValue] = useState();
  const [passwordError, setPasswordError] = useState(false);

  //Snackbar error:
  const [error, setError] = useState(false);

  const changeUsername = (e) =>{
    setUsernameValue(e.target.value);
    setUsernameError(false);
  }

  const changePassword = (e) =>{
    setPasswordValue(e.target.value);
    setPasswordError(false);
  }

  const confirm = () =>{
    let isValid = true;
    if(usernameValue?.length < 4){
      isValid = false;
      setUsernameError(true);
    }

    if(passwordValue?.length < 8){
      isValid = false;
      setPasswordError(true);
    }

    return isValid;
  }

  const onSubmit = (e) =>{
    e.preventDefault();
    let isValid = confirm();
    if(isValid){
      const query = {
        method : "POST",
        headers : {"content-type" : "application/json; charset = UTF-8"},
        body : JSON.stringify({
          username : usernameValue,
          password : passwordValue
        })
      };

      fetch("https://sheet-backend.iran.liara.run/users/signin", query)
      .then((response) => response.json())
      .then((data) =>{
        if(data?.jwtToken){
          const d = new Date();
          d.setTime(d.getTime() + (20 * 60 * 1000));
          let expires = "expires = " + d.toUTCString();
          document.cookie = `jwtToken = ${data.jwtToken}; ${expires}; path = /`;

          if(data?.role === "admin"){
            navigate("/admin-account/admin");
          }

          if(data?.role === "user"){
            navigate("/user-account");
          }
        }else{
          setError(true);
        }
      });
    }
  }

  return (
    <form className = "formHolder">
      <Snackbar open={error} autoHideDuration={6000} onClose={()=>{setError(false)}}>
        <Alert onClose={()=>{setError(false)}} severity="error" sx={{ width: '100%' }}>
          Login failed! The entered information is incorrect!
        </Alert>
      </Snackbar>
      <p style={{textAlign : "center", fontWeight : "bold"}}>Login: </p>
      <TextField id = "outlined-basic" name = "Username" sx = {inputStyle} value = {usernameValue} onChange = {(e)=>changeUsername(e)} error = {usernameError} helperText = "Please enter your username : " label = "Username" size = "medium" margin = "normal" variant="outlined" />
      <TextField id = "outlined-basic" name = "Password" type = "password" sx = {inputStyle} value = {passwordValue} onChange = {(e) => changePassword(e)} error = {passwordError} helperText = "Please enter your password : " label = "Password" size = "medium" margin = "normal" variant="outlined" />
      <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit(e)} >Login</Button>
    </form>
  )
}

export default SignInForm