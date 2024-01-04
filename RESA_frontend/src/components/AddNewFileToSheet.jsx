import React,{ useState } from 'react'
import { Button } from '@mui/material';
import axios from 'axios';
import { findToken } from '../functions/generalFunctions';

const AddNewFileToSheet = ({setShowFileModal, makeFile}) => {
    const inputStyle = { fontSize: "3rem", marginLeft: "9.5rem", padding: "1rem"};
    const buttonStyle = { fontSize: "1.7rem", padding: "1rem", borderRadius: "1.2rem", marginTop: "1.5rem" };
    const [file, setFile] = useState('');
    const handleChangeFile = (e)=>{
        setFile(e.target.files[0]);
    }

    const handleUploadFile = (e) => {
        e.preventDefault();
        const jwtToken = findToken("jwtToken", "");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jwtToken', jwtToken);
        console.log(jwtToken);
        axios.post('https://sheet-backend.iran.liara.run/upload', formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response)=>{
            if(response?.data?.fileName){
                makeFile(response?.data?.fileName)
            }
            setShowFileModal(false);
          })
          .catch((error) => {
            console.log(error);
          });
    }
    return (
        <div className="w3-modal-content">
            <header className="w3-container">
                <span onClick={()=>setShowFileModal(false)}
                    className="w3-button w3-text-red w3-display-topright"><h4>X</h4></span>
            </header>

            <form className="formHolder">
                <p style={{ textAlign: "center", fontWeight: "bold" }}>Upload File</p>
                <label for="file-upload" class="custom-button">Choose File</label>
                <input type="file" id="file-upload" onChange={handleChangeFile} style={inputStyle}/>
                <Button size="large" sx={buttonStyle} variant="contained" type="submit" onClick={handleUploadFile} >Upload</Button>
            </form>
        </div>
    )
}

export default AddNewFileToSheet