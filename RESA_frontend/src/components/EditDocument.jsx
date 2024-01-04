import React from 'react';
import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef (function Alert(props, ref,) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const EditDocument = ({loadDocuments, showEditModal, setShowEditModal}) => {

  const inputStyle = {fontSize : "10rem"};

  const buttonStyle = {fontSize : "1.7rem", padding : "1rem", borderRadius : "1.2rem", marginTop : "1.5rem"};

  const [nameValue, setNameValue] = useState(showEditModal?.name || "");
  const [nameError, setNameError] = useState(false);
  const [publicValue, setPublicValue] = useState(showEditModal?.public || false);
  const [editableValue, setEditableValue] = useState(showEditModal?.editable || false);
  const [error, setError] = useState(false);

  const changePublic = (e) =>{
      setPublicValue(e.target.checked);
  }

  const changeEditable = (e) =>{
      setEditableValue(e.target.checked);
  }

  const changeName = (e) =>{
      setNameValue(e.target.value);
      setNameError(false);
  }

  const closeEditDoc = () =>{
      setShowEditModal(null);
  }

  const confirm = () =>{
      let isValid = true;
      if (nameValue.length < 4){
          isValid = false;
          setNameError(true);
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
              headers: {"content-type": "application/json; charset = UTF-8"},
              body: JSON.stringify({
                  docID: showEditModal?.docID,
                  name: nameValue,
                  public: publicValue,
                  editable: editableValue,
                  jwtToken
              })
          }
          fetch("https://sheet-backend.iran.liara.run/documents/edit", query)
          .then((response) => response.json())
          .then((data) =>{
              if(data?.done){
                closeEditDoc();
                loadDocuments && loadDocuments();
              }
              else{
                setError(true);
              }
          })
          .catch((error) =>{
                console.log(error);
          })
      }
  }

  return (
      <>
        <Snackbar open={error} autoHideDuration={6000} onClose={()=>{setError(false)}}>
            <Alert onClose={()=>{setError(false)}} severity="error" sx={{ width: '100%' }}>
                public = false and editable = true is invalid command!
            </Alert>
        </Snackbar>
        <div className = "w3-modal-content">
            <header className = "w3-container">
                <span className = "w3-button w3-text-red w3-display-topright" onClick = {()=>closeEditDoc()}>
                    <h4>X</h4>
                </span>
            </header>
            <form className='formHolder'>
            <TextField id = "outlined-basic" name = "name" sx = {inputStyle} value = {nameValue} onChange = {(e)=>changeName(e)} error = {nameError} helperText = "Please enter your document's name : " label = "Name" size = "medium" margin = "normal" variant = "outlined" />
            <FormGroup>
                <FormControlLabel control = {<Switch onChange = {(e) => changePublic(e)}/>} checked = {publicValue} label = "Public"/>
                <FormControlLabel control = {<Switch onChange = {(e) => changeEditable(e)}/>} checked = {editableValue} label = "Editable"/>
            </FormGroup>
            <Button size = "large" sx = {buttonStyle} variant = "contained" type = "submit" onClick = {(e)=>onSubmit(e)} >Edit</Button>
            </form>
        </div>
      </>
  )
}

export default EditDocument