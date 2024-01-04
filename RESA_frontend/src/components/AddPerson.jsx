import React, {useState} from 'react';
import { TextField, Button } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { validateEmail } from '../functions/generalFunctions';

const Alert = React.forwardRef (function Alert(props, ref,) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const AddPerson = ({loadDocuments, loadUsers, setAddUser}) => {

    const inputStyle = {fontSize : "10rem"};

    const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};
  
    //Username:
    const [usernameValue, setUsernameValue] = useState();
    const [usernameError, setUsernameError] = useState(false);
  
    //FirstName:
    const [firstNameValue, setFirstNameValue] = useState();
    const [firstNameError, setFirstNameError] = useState(false);
  
    //LastName:
    const [lastNameValue, setLastNameValue] = useState();
    const [lastNameError, setLastNameError] = useState(false);
  
    //Email:
    const [emailValue, setEmailValue] = useState();
    const [emailError, setEmailError] = useState(false);
  
    //Password:
    const [passwordValue, setPasswordValue] = useState();
    const [passwordError, setPasswordError] = useState(false);
  
    //Confirm Password:
    const [conPasswordValue, setConPasswordValue] = useState();
    const [conPasswordError, setConPasswordError] = useState(false);
  
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
  
    const changeUsername = (e) =>{
      setUsernameValue(e.target.value);
      setUsernameError(false);
    }
  
    const changeFirstName = (e) =>{
      setFirstNameValue(e.target.value);
      setFirstNameError(false);
    }
  
    const changeLastName = (e) =>{
      setLastNameValue(e.target.value);
      setLastNameError(false);
    }
  
    const changeEmail = (e) =>{
      setEmailValue(e.target.value);
      setEmailError(false);
    }
  
    const changePassword = (e) =>{
      setPasswordValue(e.target.value);
      setPasswordError(false);
    }
  
    const changeConPassword = (e) =>{
      setConPasswordValue(e.target.value);
      setConPasswordError(false);
    }

    const closeAddDoc = () =>{
        setAddUser(false);
    }


    const confirm = () =>{
        let isValid = true;
        if(usernameValue?.length < 4){
            isValid = false;
            setUsernameError(true);
        }
  
        if(!validateEmail(emailValue)){
            isValid = false;
            setEmailError(true);
        }
  
        if(passwordValue?.length < 8){
            isValid = false;
            setPasswordError(true);
        }
  
        if(conPasswordValue?.length < 8 || conPasswordValue !== passwordValue){
            isValid = false;
            setConPasswordError(true);
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
                firstName : firstNameValue,
                lastName : lastNameValue,
                password : passwordValue,
                email : emailValue
            })
            };
            fetch("https://sheet-backend.iran.liara.run/users/signup", query)
            .then((response)=>response.json())
            .then((data)=>{
              if(data?.done){
                setSuccess(true);
                closeAddDoc();
                loadDocuments && loadDocuments();
                loadUsers && loadUsers();
              }else{
                setError(true);
              }
            }).catch((err)=>{
                setError(true);
            });
        }
    }
  
    return (
        <>
            <div className = 'w3-modal-content'>
                <header className = 'w3-container'>
                    <span className='w3-button w3-text-red w3-display-topright' onClick = {()=>closeAddDoc()}>
                        <h4>X</h4>
                    </span>
                </header>
                <form className = "formHolder">
                    <Snackbar open={success} autoHideDuration={6000} onClose={()=>{setSuccess(false)}}>
                        <Alert onClose={()=>{setSuccess(false)}} severity="success" sx={{ width: '100%' }}>
                            ***User is add successfully***
                        </Alert>
                    </Snackbar>
                    <Snackbar open={error} autoHideDuration={6000} onClose={()=>{setError(false)}}>
                        <Alert onClose={()=>{setError(false)}} severity="error" sx={{ width: '100%' }}>
                            There is a problem in addition of user!
                        </Alert>
                    </Snackbar>
                    <p style={{textAlign : "center", fontWeight : "bold"}}>Add new user: </p>
                    <TextField id = "outlined-basic" name = "Username" sx = {inputStyle} value = {usernameValue} onChange = {(e)=>changeUsername(e)} error = {usernameError} helperText = "Please enter your username : " label = "Username" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "firstName" sx = {inputStyle} value = {firstNameValue} onChange = {(e)=>changeFirstName(e)} error = {firstNameError} helperText = "Please enter your username : " label = "first name" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "lastName" sx = {inputStyle} value = {lastNameValue} onChange = {(e)=>changeLastName(e)} error = {lastNameError} helperText = "Please enter your username : " label = "last name" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "Email" sx = {inputStyle} value = {emailValue} onChange = {(e)=>changeEmail(e)} error = {emailError} helperText = "Please enter your email : " label = "Email address" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "Password" type = "password" sx = {inputStyle} value = {passwordValue} onChange = {(e) => changePassword(e)} error = {passwordError} helperText = "Please enter your password : " label = "Password" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "ConPassword" type = "password" sx = {inputStyle} value = {conPasswordValue} onChange = {(e) => changeConPassword(e)} error = {conPasswordError} helperText = "Please confirm your password : " label = "Confirm Password" size = "medium" margin = "normal" variant = "outlined" />
                    <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit(e)} >Add</Button>
                </form>
            </div>
        </>
    )
}

export default AddPerson