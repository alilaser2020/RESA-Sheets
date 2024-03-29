import React from 'react';
import { useState } from 'react';
import { Button } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef (function Alert(props, ref,) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const DeleteSpecificUser = ({deleteUser, setDeleteUser, loadUsers}) => {
  const HStyle = {fontSize: "3rem", textAlign: "center"};
  const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};

  const [nameValue, setNameValue] = useState(deleteUser);
  const [yesValue, setYesValue] = useState(false);
  const [noValue, setNoValue] = useState(false);
  const [error, setError] = useState(false);

  const changeYse = (e) =>{
      setYesValue(e.target.checked);
  }

  const changeNo = (e) =>{
      setNoValue(e.target.checked);
  }

  const confirm = () =>{
      let isValid = true;
      if (yesValue && noValue){
          isValid = false;
      }
      return isValid;
  }
  const onSubmit = (e) =>{
      e.preventDefault();
      let isValid = confirm();
      if (isValid){
          const jwtToken = document.cookie.split("=")[1];
          const query = {
              method: "POST",
              headers: {"Content-type" : "application/json; charset = UTF-8"},
              body: JSON.stringify({
                  name: nameValue,
                  yes: yesValue,
                  no: noValue,
                  jwtToken
              })
          };
          fetch("https://sheet-backend.iran.liara.run/users/delete", query)
          .then((response) => response.json())
          .then((data) =>{
              if(data?.done){
                setDeleteUser(null);
                loadUsers && loadUsers();
              }else{
                console.log(data?.error)
                setDeleteUser(null);
              }
          })
          .catch((error) =>{
              console.log(error);
          })
      }else{
          setError(true);
      }
  }

  return (
      <>
          <Snackbar open={error} autoHideDuration={6000} onClose={()=>{setError(false)}}>
              <Alert onClose={()=>{setError(false)}} severity="error" sx={{ width: '100%' }}>
                  yes and no together is invalid!
              </Alert>
          </Snackbar>
          <div className = 'w3-modal-content'>
              <header className = 'w3-container'>
                  <span className='w3-button w3-text-red w3-display-topright' onClick = {()=>setDeleteUser(null)}>
                      <h4>X</h4>
                  </span>
              </header>
              <form className='formHolder'>
              <h1 style = {HStyle}>Are you sure delete this user?</h1>
              <FormGroup>
                  <FormControlLabel control = {<Switch onChange = {(e) => changeYse(e)}/>} label = "Yes"/>
                  <FormControlLabel control = {<Switch onChange = {(e) => changeNo(e)}/>} label = "No"/>
              </FormGroup>
              <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit(e)} >Confirm</Button>
              </form>
          </div>
      </>
  )
}

export default DeleteSpecificUser