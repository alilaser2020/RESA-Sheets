import React from 'react';
import { useState, useEffect, /*useContext*/ } from 'react';
import { TextField, Button, Input } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { validateEmail } from '../functions/generalFunctions';
import { useNavigate } from 'react-router-dom';
import { updateTokens, findToken} from '../functions/generalFunctions';
import { UserContext } from '../App';
import axios from 'axios';

const Alert = React.forwardRef (function Alert(props, ref,) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ManageAccount = ({loadDocuments, loadUsers, setManageAccount}) => {

    const inputStyle = {fontSize : "10rem"};

    const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};
    const buttonStyle2 = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem", marginBottom: "2rem", marginTop: "2rem"};
    const navigate = useNavigate();

    // const {data, setData} = useContext(UserContext);

    //Username:
    const [usernameValue, setUsernameValue] = useState(null);
    const [usernameError, setUsernameError] = useState(false);

    //FirstName:
    const [firstNameValue, setFirstNameValue] = useState(null);
    const [firstNameError, setFirstNameError] = useState(false);

    //LastName:
    const [lastNameValue, setLastNameValue] = useState(null);
    const [lastNameError, setLastNameError] = useState(false);

    //Email:
    const [emailValue, setEmailValue] = useState(null);
    const [emailError, setEmailError] = useState(false);

    //Password:
    const [passwordValue, setPasswordValue] = useState(null);
    const [passwordError, setPasswordError] = useState(false);

    //Confirm Password:
    const [conPasswordValue, setConPasswordValue] = useState(null);
    const [conPasswordError, setConPasswordError] = useState(false);


    // Select a file:
    const [file, setFile] = useState(null);

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    // const [token, setToken] = useState()

    // useEffect(()=>{
    //     config();
    //   }, []);

    useEffect(()=>{
        userInfo();
    }, []);

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
        console.log(e.target.value);
        setPasswordValue(e.target.value);
        setPasswordError(false);
    }

    const changeConPassword = (e) =>{
        setConPasswordValue(e.target.value);
        setConPasswordError(false);
    }

    const handleChangeFile = (e)=>{
        setFile(e.target.files[0]);
    }

    const closeAddDoc = () =>{
        setManageAccount(false);
    }

    const userInfo = () =>{
        const jwtToken = document.cookie.split("=")[1];
        const query = {
            method : "POST",
            headers : {"content-type" : "application/json; charset = UTF-8"},
            body : JSON.stringify({
                jwtToken
            })
        };
        fetch("https://sheet-backend.iran.liara.run/users/userInfo", query)
        .then((response) => response.json())
        .then((data)=>{
        if(data?.done){
            setUsernameValue(data?.result?.[0]?.username)
            setFirstNameValue(data?.result?.[0]?.firstName)
            setLastNameValue(data?.result?.[0]?.lastName)
            setEmailValue(data?.result?.[0]?.email)
            // setPasswordValue(data?.result?.[0]?.password)
            // setConPasswordValue(data?.result?.[0]?.password)
            loadDocuments && loadDocuments();
            loadUsers && loadUsers();
        }else{
            setError(true);
        }
        }).catch((err)=>{
            setError(true);
        })
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
    function config(){
        let isValid = confirm();
        if(isValid){
            const jwtToken = document.cookie.split("=")[1];
            const query = {
                method: "POST",
                headers: {"content-type": "application/json; charset = UTF-8"},
                body: JSON.stringify({
                    username: usernameValue,
                    email: emailValue,
                    password: passwordValue,
                    jwtToken
            })
          };
        fetch("https://sheet-backend.iran.liara.run/users/replace", query)
        .then((response)=>response.json())
        .then((data)=>{
            if(data?.done){
                setUsernameValue(data?.result2?.[0]?.username)
                setFirstNameValue(data?.result2?.[0]?.firstName)
                setLastNameValue(data?.result2?.[0]?.lastName)
                setEmailValue(data?.result2?.[0]?.email)
                setPasswordValue(data?.result2?.[0]?.password)
                userInfo();
                updateTokens(jwtToken, data?.jwtToken);
                closeAddDoc();
                loadDocuments && loadDocuments();
                loadUsers && loadUsers();
                setSuccess(true);
            }else{
                setError(true);
            }
        }).catch((err)=>{
            setError(true);
        })
        }
    }

    const onSubmit1 = (e)=>{
    e.preventDefault();
    const jwtToken = document.cookie.split('=')[1];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jwtToken', jwtToken);
    axios.post('https://sheet-backend.iran.liara.run/users/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    }).then((response) => {
        console.log('File uploaded successfully');
        })
        .catch((error) => {
            console.error('Error uploading file:', error);
        });
    }

    const onSubmit2 = (e) =>{
        e.preventDefault();
        config();
    }
    return (
        <>
            <div className = 'w3-modal-content'>
                <header className = 'w3-container'>
                    <span className='w3-button w3-text-red w3-display-topright' onClick = {()=>closeAddDoc()}>
                        <h4>X</h4>
                    </span>
                </header>

                <form className='formHolder'>
                    <Snackbar open={success} autoHideDuration={6000} onClose={()=>{setSuccess(false)}}>
                        <Alert onClose={()=>{setSuccess(false)}} severity="success" sx={{ width: '100%' }}>
                            This is a success message!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={error} autoHideDuration={6000} onClose={()=>{setError(false)}}>
                        <Alert onClose={()=>{setError(false)}} severity="error" sx={{ width: '100%' }}>
                            This is an error message!
                        </Alert>
                    </Snackbar>
                    <p style={{ textAlign: "center", fontWeight: "bold" }}>Profile Image: </p>
                    <label for="file-upload" class="custom-button2">Set Profile Image</label>
                    <input type="file" id="file-upload" onChange={handleChangeFile}/>
                    <Button size="large" sx = {buttonStyle2} variant="contained" type="submit" onClick={(e) => onSubmit1(e)} >Upload Profile</Button>

                    <p style={{textAlign : "center", fontWeight: "bold"}}>Config Account: </p>
                    <TextField id = "outlined-basic" name = "Username" sx = {inputStyle} value = {usernameValue} onChange = {(e)=>changeUsername(e)} error = {usernameError} helperText = "Please enter your username : " label = {typeof(usernameValue) == "string" ? usernameValue : "Username"} size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "firstName" sx = {inputStyle} value = {firstNameValue} onChange = {(e)=>changeFirstName(e)} error = {firstNameError} helperText = "Please enter your first name : " label = {typeof(firstNameValue) == "string" ? firstNameValue : "first name"} size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "lastName" sx = {inputStyle} value = {lastNameValue} onChange = {(e)=>changeLastName(e)} error = {lastNameError} helperText = "Please enter your last name : " label = {typeof(lastNameValue) == "string" ? lastNameValue : "last name"} size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "Email" sx = {inputStyle} value = {emailValue} onChange = {(e)=>changeEmail(e)} error = {emailError} helperText = "Please enter your email : " label = {typeof(emailValue) == "string" ? emailValue : "Email"} size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "Password" type = "password" sx = {inputStyle} value = {passwordValue} onChange = {(e) => changePassword(e)} error = {passwordError} helperText = "Please enter your password : " label = "password" size = "medium" margin = "normal" variant = "outlined" />
                    <TextField id = "outlined-basic" name = "ConPassword" type = "password" sx = {inputStyle} value = {conPasswordValue} onChange = {(e) => changeConPassword(e)} error = {conPasswordError} helperText = "Please confirm your password : " label = "Confirm password" size = "medium" margin = "normal" variant = "outlined" />
                    <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit2(e)} >Config</Button>
                </form>
            </div>
        </>
    )
}

export default ManageAccount