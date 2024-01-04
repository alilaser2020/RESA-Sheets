import React from 'react';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const GoToDoc = ({setGoDoc}) => {
    
    const inputStyle = {fontSize : "10rem"};
    const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};

    const navigate = useNavigate();

    const [URL, setURL] = useState('');
    const [URLError, setURLError] = useState(false);
    const closeAddDoc = () =>{
        setGoDoc(false);
    }

    const changeURL = (e) =>{
        setURL(e.target.value);
    }
    const onSubmit = (e) =>{
        e.preventDefault();
        window.location.replace(URL);
        setGoDoc(false);
    }
    return (
    <>
        <div className = 'w3-modal-content'>
            <header className = 'w3-container'>
                <span className='w3-button w3-text-red w3-display-topright' onClick = {()=>{closeAddDoc()}}>
                    <h4>X</h4>
                </span>
            </header>
            <form className='formHolder' enctype="multipart/form-data">
                <p style={{textAlign : "center", fontWeight : "bold"}}>Edit Profile: </p>
                <TextField id = "outlined-basic" name = "name" sx = {inputStyle} value = {URL} onChange = {(e)=>changeURL(e)} error = {URLError} helperText = "Please enter your document's URL : " label = "URL" size = "medium" margin = "normal" variant = "outlined" />
                <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit(e)} >Get URL</Button>
            </form>
        </div>
    </>
  )
}

export default GoToDoc