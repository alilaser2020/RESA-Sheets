import React, { useState, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Header from '../components/Header';
import { adminChecking } from '../functions/generalFunctions';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import KeyIcon from '@mui/icons-material/Key';
import AddNewDocument from '../components/AddNewDocument';
import EditDocument from '../components/EditDocument';
import AccessDocument from '../components/AccessDocument';
import ManageAccount from '../components/ManageAccount';
import AddPerson from '../components/AddPerson';
import { Directions } from '@mui/icons-material';
// import { UserContext } from '../App';
import { updateTokens } from '../functions/generalFunctions';
import { doRedirect } from '../functions/generalFunctions';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import BlockIcon from '@mui/icons-material/Block';
import IosShareIcon from '@mui/icons-material/IosShare';
import GoToDoc from '../components/GoToDoc';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteAdmin from '../components/DeleteAdmin';
import DeleteSpecificUser from '../components/DeleteSpecificUser';
import DeleteDocument from '../components/DeleteDocument';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AdminPanelPage = () => {

  // const { data, setData } = useContext(UserContext);
  // doRedirect(!data?.user?.isLogin || data?.user?.role != "admin", "/register/login");
  const {role} = useParams();
  // console.log(role);
  const [state, setState] = useState(role == "admin" ? true : false);
  useEffect(()=>{
    setState(role == "admin" ? true : false)
  }, [role]);
  // console.log(state)
  if(!state){
    window.location.replace("/user-account");
  }
  adminChecking();
  const [documentsData, setDocumentsData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manageAccount, setManageAccount] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [goDoc, setGoDoc] = useState(null);
  const [addUser, setAddUser] = useState(false);
  const [users, setUsers] = useState(null)
  const [usernameValue, setUsernameValue] = useState();
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);

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
  
  function loadUsers() {
    const jwtToken = document.cookie.split('=')[1];

    const query = {
      method: "POST",
      headers: {"Content-type": "application/json; charset = UTF-8"},
      body: JSON.stringify({
      }),
    };

    fetch('https://sheet-backend.iran.liara.run/users/list/load', query)
      .then((response) => response.json())
      .then((data) => {
        if (data?.users) {
          setUsers(data?.users)
        }
      })
  }

  useEffect(() => {
    loadDocuments();
    loadUsers();
    getUsername();
  }, [])

  if (!users) return 'loading...'

  const cols1 = [
    { field: "username", headerName: "Username", width: 150 },
    { field: "role", headerName: "Role", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "creationDate", headerName: "Creation Date", width: 150 },
    {
      field: "status1", headerName: "Status", width: 150, disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <>
            {params?.row?.status ?
            <p className = 'w3-center'>
              Active
            </p> : 
            <p className = 'w3-center'>
              Blocked
            </p>}
          </>
        );
      }
    },
    {
      field: "status2", headerName: "Block", width: 150, disableClickEventBubbling: true,
      renderCell: (params) => {
        const userID = params?.row?.username
        return (
          <div style = {{ cursor: 'pointer' }}>
            {params?.row?.status ?
              <BlockIcon onClick = {() => blockUser(userID, loadUsers)} />
              : <PublishedWithChangesIcon onClick = {() => unblockUser(userID, loadUsers)} />}
          </div>
        );
      }
    },
    {
      field: "status3", headerName: "Remove User", width: 150, disableClickEventBubbling: true,
      renderCell: (params) => {
        const userID = params?.row?.username
        return (
          <div style={{ cursor: 'pointer' }}>
            <PersonRemoveIcon onClick={()=>{setDeleteUser(userID)}} />
          </div>
        );
      }
    }
  ];


  const cols2 = [
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

  return (
    <>
      <div className = "header-context-2">
        <Header />
      </div>
    {/* <h1>Admin account</h1> */}
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
    {addUser ?
      <div className = "w3-modal">
        <AddPerson loadDocuments = {loadDocuments} loadUsers = {loadUsers} setAddUser = {setAddUser} />
      </div>
      : " "}
    {goDoc ?
      <div className = "w3-modal">
        <GoToDoc setGoDoc = {setGoDoc} />
      </div>
      : " "}
    {deleteUser ?
      <div className = "w3-modal">
        <DeleteSpecificUser deleteUser = {deleteUser} setDeleteUser = {setDeleteUser} loadUsers = {loadUsers}/>
      </div>
      : " "}
    {deleteAdmin ?
      <div className = "w3-modal">
        <DeleteAdmin deleteAdmin = {deleteAdmin} setDeleteAdmin = {setDeleteAdmin}/>
      </div>
      : " "}
    {showDeleteModal ?
      <div className = "w3-modal">
        <DeleteDocument showDeleteModal = {showDeleteModal} setShowDeleteModal = {setShowDeleteModal} loadDocuments = {loadDocuments} />
      </div>
      : " "}
    <div id = "adminDiv" onClick = {()=>{reloadClick()}}>
      <AdminPanelSettingsIcon id = "adminPanel"/>
      <h1 id = "admin">Admin: {usernameValue}</h1>
    </div>
      <div className="dashboard">
        <div>
          {/* <AccountCircleIcon id = "imageProfile" onClick = {()=>{setGoDoc(true)}}/> */}
          <ManageAccountsIcon id = "settingAccount" onClick = {()=>{setManageAccount(true)}}/>
          <PersonAddIcon id = "addPerson" onClick={() => setAddUser(true)} />
          <PersonRemoveIcon id = "deleteAccount" onClick={()=>{setDeleteAdmin(usernameValue)}} />
          <IosShareIcon id = "URL" onClick = {()=>{setGoDoc(true)}}/>
        </div>
        <h3 style = {{textAlign: "center", fontFamily: "New Roman", fontSize: "35px"}}>Users list</h3>
        <div style = {{ height : 500, width : "100%", marginTop : "3rem"}}>
          <DataGrid rows={users} columns={cols1} />
        </div>
      </div>

      <div className="dashboard">
      <h3 style = {{textAlign: "center", fontFamily: "New Roman", fontSize: "35px"}}>Documents list</h3>
        <div style={{display: "flex", alignItems: "center", justifyContent: "flex-start", borderColor: "red"}}>
          <div className = "w3-button w3-green w3-round-large w3-margin-top" onClick = {()=>setShowAddModal(true)}>Add new document</div>
        </div>
        <div style = {{ height : 500, width : "100%", marginTop : "3rem"}}>
          <DataGrid rows = {documentsData} columns = {cols2}/>
        </div>
      </div>
    </>
  )
}

export default AdminPanelPage

async function blockUser(userID, reload) {
  const jwtToken = document.cookie.split('=')[1];

  const query = {
    method: "POST",
    headers: {"Content-type": "application/json; charset = UTF-8"},
    body: JSON.stringify({
      userID,
      jwtToken
    }),
  };

  let response = await fetch("https://sheet-backend.iran.liara.run/users/block", query)
    .then((response) => response.json())
    .then((data) => {
      if (data?.done) {
        reload && reload();
      }
    })
  return response
}

async function unblockUser(userID, reload) {
  const jwtToken = document.cookie.split('=')[1];

  const query = {
    method: "POST",
    headers: {"Content-type": "application/json; charset = UTF-8"},
    body: JSON.stringify({
      userID,
      jwtToken
    })
  };

  let response = await fetch('https://sheet-backend.iran.liara.run/users/unblock ', query)
    .then((response) => response.json())
    .then((data) => {
      if (data?.done) {
        reload && reload();
      }
    })
  return response
}