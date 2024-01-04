import React, { useState, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Header from '../components/Header';
import FindInPageTwoToneIcon from '@mui/icons-material/FindInPageTwoTone';
import { userChecking } from '../functions/generalFunctions';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import KeyIcon from '@mui/icons-material/Key';
import AddNewDocument from '../components/AddNewDocument';
import EditDocument from '../components/EditDocument';
import AccessDocument from '../components/AccessDocument';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ManageAccount from '../components/ManageAccount';
import { Directions } from '@mui/icons-material';
import { UserContext } from '../App';
import { updateTokens } from '../functions/generalFunctions';
import { doRedirect } from '../functions/generalFunctions';
import IosShareIcon from '@mui/icons-material/IosShare';
import GoToDoc from '../components/GoToDoc';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DeleteUser from '../components/DeleteUser';
import DeleteDocument from '../components/DeleteDocument';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserAccountPage = () => {
// const {data, setData} = useContext(UserContext);
// doRedirect(!data?.user?.isLogin, "/register/login");
userChecking();
const [documentsData, setDocumentsData] = useState([]);
const [showAddModal, setShowAddModal] = useState(false);
const [manageAccount, setManageAccount] = useState(false);
const [showEditModal, setShowEditModal] = useState(null);
const [showAccessModal, setShowAccessModal] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(null);
const [goDoc, setGoDoc] = useState(null);
const [usernameValue, setUsernameValue] = useState();
const [deleteUser, setDeleteUser] = useState(null);

const getUsername = () => {
  const jwtToken = document.cookie.split("=")[1];
  const query = {
      method : "POST",
      headers : {"content-type" : "application/json; charset = UTF-8"},
      body : JSON.stringify({
          jwtToken,
      })
  };
  fetch("https://sheet-backend.iran.liara.run/users/userInfo", query)
  .then((response) => response.json())
  .then((data)=>{
    if(data?.done){
      setUsernameValue(data?.result?.[0]?.username)
    }
  }).catch((err)=>{
      console.log(err);
  })
}
const reloadClick = () => {
  const jwtToken = document.cookie.split("=")[1];
  const query = {
      method : "POST",
      headers : {"content-type" : "application/json; charset = UTF-8"},
      body : JSON.stringify({
          username : usernameValue
      })
    };
  fetch("https://sheet-backend.iran.liara.run/users/reload", query)
  .then((response)=>response.json())
  .then((data)=>{
    if(data?.jwtToken){
      updateTokens("jwtToken", data?.jwtToken);
      loadDocuments && loadDocuments();
    }
  }).catch((error)=>{
    console.log(error);
  })
  window.location.reload();
}

const loadDocuments = () =>{
const jwtToken = document.cookie.split("=")[1];
const query = {
    method : "POST",
    headers : {"Content-type" : "application/json; charset = UTF-8"},
    body : JSON.stringify({
      jwtToken
    })
  };
  fetch("https://sheet-backend.iran.liara.run/documents/load", query)
  .then((response) => response.json())
  .then((data) => {
    if(data?.listDocuments){
      setDocumentsData(data.listDocuments?.map((doc)=>{
        return{
            id : doc._id,
            ...doc
            }
          }));
        }
      }
    )
  }

  const deleteDocument = (docID) =>{
    if(docID){
      const jwtToken = document.cookie.split("=")[1];
      const query = {
        method : "POST",
        headers : {"Content-type" : "application/json; charset = UTF-8"},
        body : JSON.stringify({
          docID,
          jwtToken
        })
      }
      fetch("https://sheet-backend.iran.liara.run/documents/delete", query)
      .then((response) => response.json())
      .then((data) =>{
        if(data?.done){
          loadDocuments && loadDocuments();
        }
      })
      .catch((error) =>{
        console.log({error : "Catch error!"})
      })
    }
  }

  function loadUsers() {}

  useEffect(()=>{
    loadDocuments();
    getUsername();
  }, []);

  if (!documentsData) return 'loading...'

  const cols = [
    {field : "docID", headerName : "Identify", width : 150},
    {field : "name", headerName : "Name", width : 150},
    {field : "creatorID", headerName : "Owner", width : 150},
    {field : "versions", headerName : "Last version", width : 150, disableClickEventBubbling: true,
    renderCell: (params) =>{
      return (
        <>
          {params?.row?.versions?.at(-1)}
        </>
      )
    }
    },
    {field : "access", headerName : "Accessor", width : 150},
    {field : "public", headerName : "Public", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
      if(params?.row?.public){
          return(
            <p className='w3-text-green'>Yes</p>
          );
        }
      else{
          return(
            <p className='w3-text-red'>No</p>
          );
        }
      }
    },
    {field : "editable", headerName : "Edit", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
      if(params?.row?.editable){
          return(
            <p className='w3-text-green'>Yes</p>
          );
        }
      else{
          return(
            <p className='w3-text-red'>No</p>
          );
        }
      }
    },
    {field : "editContent", headerName : "Edit Content", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
        return(
          <Link to = {`/document/${params?.row?.docID}`}>
            <RemoveRedEyeIcon/>
          </Link>
        )
      }
    },
    {field : "giveAccess", headerName : "Access", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
        return(
          <div style = {{cursor : "pointer", display : "flex", justifyContent : "center", alignItems : "center"}}>
            <KeyIcon onClick = {()=>{setShowAccessModal(params?.row)}}/>
          </div>
        )
      }
    },
    {field : "edit", headerName : "Edit", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
        return(
          <div style = {{cursor : "pointer", display : "flex", justifyContent : "center", alignItems : "center"}}>
            <ModeEditOutlineIcon onClick = {()=>{setShowEditModal(params?.row)}}/>
          </div>
        )
      }
    },
    {field : "delete", headerName : "Delete", width : 150, disableClickEventBubbling: true,
    renderCell: (params) => {
        return(
          <div style = {{cursor : "pointer", display : "flex", justifyContent : "center", alignItems : "center"}}>
            <DeleteRoundedIcon onClick = {()=>{setShowDeleteModal(params?.row?.docID)}}/>
          </div>
        )
      }
    }
  ];

  // console.log(data?.user?.isLogin)

  return (
    <>
    <div className = "header-context-2">
        <Header />
    </div>
    {/* <h1>User account</h1> */}
    {showAddModal ?
      <div className = "w3-modal">
        <AddNewDocument loadDocuments={loadDocuments} setShowAddModal={setShowAddModal} />
      </div>
      : " "}
    {showEditModal ?
      <div className = "w3-modal">
        <EditDocument loadDocuments = {loadDocuments} showEditModal = {showEditModal} setShowEditModal = {setShowEditModal}/>
      </div>
      : " "}
    {showAccessModal ?
      <div className = "w3-modal">
        <AccessDocument loadDocuments = {loadDocuments} showAccessModal = {showAccessModal} setShowAccessModal = {setShowAccessModal}/>
      </div>
      : " "}
    {manageAccount ?
      <div className = "w3-modal">
        <ManageAccount loadDocuments = {loadDocuments} loadUsers = {loadUsers} setManageAccount = {setManageAccount} />
      </div>
      : " "}
    {goDoc ?
      <div className = "w3-modal">
        <GoToDoc setGoDoc = {setGoDoc} />
      </div>
      : " "}
    {deleteUser ?
      <div className = "w3-modal">
        <DeleteUser deleteUser = {deleteUser} setDeleteUser = {setDeleteUser}/>
      </div>
      : " "}
    {showDeleteModal ?
      <div className = "w3-modal">
        <DeleteDocument showDeleteModal = {showDeleteModal} setShowDeleteModal = {setShowDeleteModal} loadDocuments = {loadDocuments} />
      </div>
      : " "}
    <div style = {{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <h1 id = "username" onClick = {()=>{reloadClick()}} >User: {usernameValue}</h1>
    </div>
    <div className = "dashboard">
      <h3 style = {{textAlign: "center", fontFamily: "New Roman", fontSize: "35px"}}>Documents list</h3>
      <div style={{display: "flex", alignItems: "center", justifyContent: "flex-start", borderColor: "red"}}>
        <div>
          <div className = "w3-button w3-green w3-round-large w3-margin-top" onClick = {()=>setShowAddModal(true)}>Add new document</div>
        </div>
        <div>
          <ManageAccountsIcon id = "settingAccount" onClick = {()=>{setManageAccount(true)}}/>
        </div>
        <div>
          <PersonRemoveIcon id = "deleteAccount" onClick={() => setDeleteUser(usernameValue)} />
        </div>
        <div>
          <IosShareIcon id = "URL" onClick = {()=>{setGoDoc(true)}}/>
        </div>
        {/* <div>
          <AccountCircleIcon id = "imageProfile" onClick = {()=>{setGoDoc(true)}}/>
        </div> */}
      </div>

      <div style = {{ height : 500, width : "100%", marginTop : "3rem"}}>
        <DataGrid rows = {documentsData} columns = {cols}/>
      </div>
    </div>
    </>
  )
};

export default UserAccountPage