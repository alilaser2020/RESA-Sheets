import React from 'react'
import { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import axios from 'axios';

const EditProfile = ({setEditProfile, userImage}) => {
    
    const inputStyle = {fontSize : "10rem"};

    const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};

    const [fileContent, setFileContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [file, setFile] = useState('');
    console.log(selectedFile)
    const closeAddDoc = () =>{
        setEditProfile(false);
    }

    const handleChangeFile = (e)=>{
      setFile(e.target.files[0]);
    }

    const handleUploadFile = (e) => {
        e.preventDefault();
        const jwtToken = document.cookie.split('=')[1];
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jwtToken', jwtToken);
        axios.post('https://sheet-backend.iran.liara.run/users/upload/profile', formData,{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then((response) => {
            console.log(response.data)
            // setProfilePhoto(response.data)
          })
          .catch((error) => {
            console.log(error)
          });
    };

    useEffect(()=>{
      setUserProfile(userImage);
  }, []);
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
              <div style = {{display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem"}}>
                <img for="file-upload" className = "profileImg2" src={typeof(userProfile) == 'string' ? `https://sheet-backend.iran.liara.run/uploads/${userProfile}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt = "invalid!"/>
              </div>
              <input type = "file" onChange={handleChangeFile} />
              <p>{fileContent}</p>
              <input type="file" id="file-upload" onChange={handleChangeFile}/>
              <Button size="large" sx = {buttonStyle} variant="contained" type="submit" onClick={(e) => handleUploadFile(e)} >Upload Profile</Button>
            </form>
        </div>
    </>
  )
}

export default EditProfile