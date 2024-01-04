import React from 'react';
import { useState, useEffect} from 'react';
import HistoryIcon from '@mui/icons-material/History';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ShareIcon from '@mui/icons-material/Share';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { Foundation, SavedSearch } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import EditDocument from '../components/EditDocument';
import AddNewFileToSheet from '../components/AddNewFileToSheet';
import EditProfile from '../components/EditProfile';
import GoToDoc from '../components/GoToDoc';
import io from 'socket.io-client';
import { getValue, updateTokens } from '../functions/generalFunctions';
const socket = io("https://socketserver.iran.liara.run");

const Alert = React.forwardRef (function Alert(props, ref,) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DocumentPage = () => {
  const styleIcons = { fontSize : "4rem", padding : "0.3rem"};
  const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

  const [alpha, setAlpha] = useState(alphabet);
  const [data, setData] = useState(null);
  const [panelState, setPanelState] = useState(true);
  const [selectedCell, setSelectedCell] = useState({});
  const [focusedCell, setFocusedCell] = useState({});
  const [textColorMenu, setTextColorMenu] = useState(false);
  const [bgColorMenu, setBgColorMenu] = useState(false);
  const [textAlignMenu, setTextAlignMenu] = useState(false);
  const [inputValue, setInputValue] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copyURL, setCopyURL] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  //const [getLink, setGetLink] = useState(false);
  const {docID} = useParams();
  const [isResponsive, setIsResponsive] = useState(false);
  // const [responsive, setResponsive] = useState({});
  // const [extraData, setExtraData] = useState(null);
  // const [username, setUsername] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [access, setAccess] = useState(false);
  const [editable, setEditable] = useState(false);
  const [goDoc, setGoDoc] = useState(null);
  const [docName, setDocName] = useState(null);
  const [arrayVersion, setArrayVersion] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [toggle, setToggle] = useState(false);

  const loadProFileImage = () => {
    const jwtToken = document.cookie.split("=")[1];
    const query = {
        method: "POST",
        headers: {
            "Content-type" : "application/json; charset = UTF-8"
        },
        body: JSON.stringify({
          jwtToken
        })
    };
    fetch("https://sheet-backend.iran.liara.run/users/userInfo", query)
    .then((response) => response.json())
    .then((data) => {
        if(data?.result){
            setUserImage(data?.result?.[0]?.profileImage);
        }
    })
    .catch((error) => {
        console.log(error);
    })
  }

  const reloadClick = () => {
    const jwtToken = document.cookie.split("=")[1];
    const query = {
        method: "POST",
        headers: {"content-type" : "application/json; charset = UTF-8"},
        body: JSON.stringify({
            docID,
            jwtToken
        })
      };
    fetch("https://sheet-backend.iran.liara.run/versions/load", query)
    .then((response)=>response.json())
    .then((data)=>{
      if(data?.jwtToken){
        updateTokens("jwtToken", data?.jwtToken);
        loadLastVersion && loadLastVersion();
      }
    }).catch((error)=>{
      console.log(error);
    })
    window.location.reload();
  }

  const docInfo = () => {
    //console.log(docName);
    const jwtToken = document.cookie.split("=")[1];
    const query = {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset = UTF-8"
        },
        body: JSON.stringify({
          docID,
          name: docName,
          jwtToken
        })
    };
    fetch("https://sheet-backend.iran.liara.run/documents/edit/name", query)
    .then((response) => response.json())
    .then((data) => {
        if(data?.done){
            // setDocName(data?.doc?.[0]?.result?.username);
            setDocName(data?.name);
        }
    })
    .catch((error) => {
        console.log(error);
    })
  }

  const getLink = () => {
    const currentUrl = window.location.href;
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = currentUrl;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    setCopyURL(true)
  };

  const toggleMenu = () => {
    setIsResponsive(!isResponsive);
    const newStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '10%',
      height: '100rem',
      fontSize: "25px",
      /* margin-left: 3rem; */
      /* margin-right: 2rem; */
    };

    // Update the state to apply the new style
    // setResponsive(newStyle);
    //console.log(responsive)
  };

  const handleClick = (e) => {
    const clickedIcon = e.target.closest('i');
    if (!clickedIcon || clickedIcon.id !== 'TCM') {
      setTextColorMenu(false)
    }

    if (!clickedIcon || clickedIcon.id !== 'BCM') {
      setBgColorMenu(false)
    }

    if (!clickedIcon || clickedIcon.id !== 'TAM') {
      setTextAlignMenu(false)
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(()=>{
    socket.on(docID, (message)=>{
      if(message == "Updated"){
        loadLastVersion();
      }else{
        setData(message);
      }
    });
  }, []);

  useEffect(()=>{
    loadLastVersion();
    loadProFileImage();
    // docInfo();
  }, []);

  if(!data) return "Loading..."

  if(!access) return "No access"

  if(!docID) return "Not ID"

  //console.log(docName);

  function loadLastVersion(){
    const jwtToken = document.cookie.split("=")[1];
    const query = {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset = UTF-8"
      },
      body: JSON.stringify({
        docID,
        jwtToken
      })
    };
    fetch("https://sheet-backend.iran.liara.run/versions/load", query)
    .then((response) => response.json())
    .then((d) => {
      //console.log(d)
      setAccess(d.done);
      if (d?.docName){
        setDocName(d?.docName);
      }
      setEditable(d?.editable);
      if(d?.done && d?.data){
        setData(d?.data);
        // if(arrayVersion.length == 0){ setArrayVersion([d.data])}
      }
      else{
        let emptyData = [];
        for(let i = 0; i < 50; i++){
          emptyData.push(alphabet?.map(r =>{
            return{
              type: "string",
              value: ""
            }
          }));
        }
        setData(emptyData);
      }
    });
  };

  function saveDocument(){
    docInfo();
    if((selectedCell?.rowIndex || selectedCell?.rowIndex == 0) && (selectedCell?.colIndex || selectedCell?.colIndex == 0)){
      data[selectedCell.rowIndex][selectedCell.colIndex].value = typeof(inputValue) == "string" || typeof(inputValue) == Number ? inputValue : data[selectedCell.rowIndex][selectedCell.colIndex].value;
      setInputValue(null);
      setSelectedCell({});
      let newVersions = [...arrayVersion, data];
      setArrayVersion(newVersions);
      setCurrent(pre=>pre + 1);
    }
    const jwtToken = document.cookie.split("=")[1];
    const query = {
      method: "POST",
      headers: {
        "content-type": "application/json; charset = UTF-8"
      },
      body: JSON.stringify({
        docID,
        jwtToken,
        data
      })
    };
    fetch("https://sheet-backend.iran.liara.run/versions/create", query)
    .then((response) => response.json())
    .then((d)=>{
      if(d?.done){
        loadLastVersion();
        socket.emit("docUpdater", docID);
      }
    });
  };

  function goNext(){
    if(current < arrayVersion.length - 1){
        setData(arrayVersion?.[current + 1]);
        setCurrent(current + 1);
    }
  }

  function goPre(){
    if(current > 0){
        setData(arrayVersion?.[current - 1]);
        setCurrent(current - 1);
    }
  }

  function clickSave(){
    if(editable){
      saveDocument();
      setSuccess(true);
    }
  }

  const onSubmit = (e) =>{
    e.preventDefault();
    if(editable){
      saveDocument();
    }
  }

  //console.log(username);

  const onChange = (e) =>{
    if (editable){
      setInputValue(e.target.value);
      let newData = [...data];
      newData[selectedCell.rowIndex][selectedCell.colIndex].value = e.target.value;
      setData(newData);
      socket.emit("docVersionUpdater", {docID, data: newData});
    }
  }

  const changeColor = (e) =>{
    //Delete class from pre-item:
    let preItem = document.querySelector(".makeColorBlack");
    preItem?.classList?.remove("makeColorBlack");

    //Add class to new-item(e):
    e.target.classList.add("makeColorBlack");
  }

  function containValue(rowIndex, colIndex){
    if(typeof(inputValue) == 'string' || typeof(inputValue) == Number ){
      if(editable){
        saveDocument();
      }
    }
    setInputValue(null);
    setSelectedCell({rowIndex, colIndex});
  }

  const docNameChange = (e) =>{
    // if (editable){
      setDocName(e.target.value);
    // }
  }
  
  function printDoc(){
    window.print();
  }

  function makeDollar(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'currency';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makePercent(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'percent';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeNumber(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'number';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeString(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'string';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeLink(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'link';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function unLink(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'string';
      newData[focusedCell.rowIndex][focusedCell.colIndex].value = '';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeFile(fileName){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'file';
      newData[focusedCell.rowIndex][focusedCell.colIndex].value = fileName
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  
  function attachOff(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].type = 'string';
      newData[focusedCell.rowIndex][focusedCell.colIndex].value = '';
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function decreaseFont(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)) {
      if(data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontsize >= 10 || !data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontsize){
        let newData = [...data]
        newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
          ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
          fontSize: (data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontSize || 14) - 1
        }
        setData(newData)
        if(editable){
          saveDocument();
        }
      }
    }
  }

  function increaseFont(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      if(data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontSize <= 40 || !data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontSize){
        let newData = [...data];
        newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
          ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
          fontSize: (data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.fontSize || 14) + 1
        }
        setData(newData);
        if(editable){
          saveDocument();
        }
      }
    }
  }

  function makeBold(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        isBold: !data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.isBold
      }
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeItalic(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        isItalic: !data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.isItalic
      }
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  function makeLineThrough(){
    if((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        isLineThrough: !data[focusedCell.rowIndex][focusedCell.colIndex]?.config?.isLineThrough
      }
      setData(newData);
      if(editable){
        saveDocument();
      }
    }
  }

  //Select text color:
  function changeTextColor(color){
    if((focusedCell.rowIndex == 0 || focusedCell.rowIndex) && (focusedCell.colIndex == 0 || focusedCell.colIndex)){
      let newData = [...data];
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...data[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        textColor: color
      }
      setData(newData);
      // saveDocument();
    }
  }

  function getTextColorMenu(){
    const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple', 'white'];
    return (
      <div style = {{position: "absolute", display: "flex", flexDirection: "column", margin: "auto", justifyContent: "center", backgroundColor: "#edf2fa"}}>
        {
          colors.map((color) =>{
            return(
              <div style = {{width: "25px", height: "25px", backgroundColor: color}} onClick = {()=>changeTextColor(color)}></div>
            )
          })
        }
      </div>
    )
  }

  function toggleTextColorMenu(){
    setTextColorMenu(pre=>!pre);
  }

  //Select background color:
  function changeBgColor(color) {
    if ((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)) {
      let newData = [...data]
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        backgroundColor: color
      }
      setData(newData)
      // saveDocument();
    }
  }

  function getColorMenu() {
    const colors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple', 'white'];
    return (
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', margin: 'auto', justifyContent: 'center', backgroundColor: '#edf2fa' }}>
        {
          colors.map(color => {
            return (
              <div style={{ width: '25px', height: '25px', backgroundColor: color }} onClick={() => changeBgColor(color)}></div>
            )
          })
        }
      </div>
    )
  }

  function toggleBgColorMenu() {
    setBgColorMenu(pre=>!pre);
  }

  //Select text align:
  function changeTextAlign(direction) {
    if ((focusedCell?.rowIndex || focusedCell?.rowIndex == 0) && (focusedCell?.colIndex || focusedCell?.colIndex == 0)) {
      let newData = [...data]
      newData[focusedCell.rowIndex][focusedCell.colIndex].config = {
        ...newData[focusedCell.rowIndex][focusedCell.colIndex]?.config || {},
        textAlign: direction
      }
      setData(newData);
      // saveDocument();
    }
  }

  function getTextAlignMenu() {
    const directions = ['right', 'center', 'left']
    return (
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', margin: 'auto', justifyContent: 'center', backgroundColor: '#edf2fa' }}>
        {directions.map(direction => {
            return (
                <div style={{ width: '50px', height: '25px', fontSize: '14px', textAlign: 'center' }} onClick={() => changeTextAlign(direction)}>{direction}</div>
              )
          })
        }
      </div>
    )
  }

  function toggleTextAlignMenu() {
    setTextAlignMenu(pre=>!pre);
  }

  //console.log(docName);

  return (
    <>
      {showFileModal ?
      <div className="w3-modal">
        <AddNewFileToSheet setShowFileModal = {setShowFileModal} makeFile={makeFile} />
      </div> : ''}

      {editProfile ?
      <div className = "w3-modal">
        <EditProfile setEditProfile = {setEditProfile} userImage = {userImage}/>
      </div>
      : " "}
      {goDoc ?
      <div className = "w3-modal">
        <GoToDoc setGoDoc = {setGoDoc} />
      </div>
      : " "}

      <div>
        {/* <h1>Document Page</h1> */}
        {/* Define Header of Document Page: */}
        <Snackbar open={success} autoHideDuration={6000} onClose={()=>{setSuccess(false)}}>
          <Alert onClose={()=>{setSuccess(false)}} severity="success" sx={{ width: '100%' }}>
            This is a success message!
          </Alert>
        </Snackbar>
        <Snackbar open={copyURL} autoHideDuration={6000} onClose={()=>{setCopyURL(false)}}>
          <Alert onClose={()=>{setCopyURL(false)}} severity="success" sx={{ width: '100%' }}>
            Copy URL was successfully!
          </Alert>
        </Snackbar>

    {panelState ? <div className = "topHeader">
      <div className='headerOptions'>
        <div className='documentImageContainer' onClick = {()=>reloadClick()}>
          {/* <Link to = "/"> */}
            <img className='documentImage' src="https://www.gstatic.com/images/branding/product/2x/sheets_2020q4_48dp.png" alt = "invalid!" />
          {/* </Link> */}
        </div>
        <div className='documentOptions'>
          <div className='spacer'></div>
          <div className='headerRow1'>
            <div className='documentName'>
              <input type = "text" style = {{fontSize: "2.5rem"}} onChange = {(e)=>{docNameChange(e)}} value = {docName == null ? "Untitled Document" : docName}/>
            </div>
            <div className='documentActions'>
              <DownloadIcon className='actionIcon' onClick={()=>{downloadCSV(convertToArray(data), "export.csv")}} sx = {styleIcons}/>
              <ShareIcon className='actionIcon' onClick = {()=>{setGoDoc(true)}} sx = {styleIcons}/>
              <CloudDoneRoundedIcon className='actionIcon' onClick = {clickSave} sx = {styleIcons}/>
            </div>
          </div>
          {/* <div className='headerRow2'>
            <div className='headerMenuBTN'>File</div>
            <div className='headerMenuBTN'>Edit</div>
            <div className='headerMenuBTN'>View</div>
            <div className='headerMenuBTN'>Insert</div>
            <div className='headerMenuBTN'>Format</div>
            <div className='headerMenuBTN'>Data</div>
            <div className='headerMenuBTN'>Tools</div>
            <div className='headerMenuBTN'>Extensions</div>
            <div className='headerMenuBTN'>Help</div>
          </div> */}
          <div className='spacer'></div>
        </div>
      </div>

      <div className='headerActionBTN'>
          <Link to = {`/history/${docID}`}>
            <div className='historyIcon'>
              <HistoryIcon sx = {{fontSize : "2rem"}}/>
            </div>
          </Link>
        <div className='headerShareBTN' onClick = {()=>{getLink()}}>
          <p>Share</p>
          <LockOpenRoundedIcon sx = {{fontSize : "2rem"}}/>
        </div>
        <div>
          <img onClick = {()=>{setEditProfile(true)}} className = "profileImg1" src={typeof(userImage) == 'string' ? `https://sheet-backend.iran.liara.run/uploads/${userImage}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt = "invalid!"/>
        </div>
      </div>
    </div> : ''}

    {/* Define tools-bar of Document Page: */}
    <div className="toolsBar">
        {window.innerWidth > 1000 ? <><div className='toolsBarIconContainer'>
        {/* <a href="#" className="menu-icon" onClick={toggleMenu}>&#9776;</a> */}
        <i className='material-icons' onClick = {goPre}>undo</i>
        <i className='material-icons' onClick = {goNext}>redo</i>
        <i className='material-icons' onClick = {printDoc}>print</i>
        <i className='material-icons' onClick = {makeDollar}>attach_money</i>
        <i className='material-icons' onClick = {makePercent}>percent</i>
        <i className='material-icons' onClick = {makeNumber}>123</i>
        <i className='material-icons' onClick = {makeString}>abc</i>
        <i className='material-icons' onClick = {decreaseFont}>remove</i>
        <i className='material-icons' onClick = {increaseFont}>add</i>
        <i className='material-icons' onClick = {makeBold}>format_bold</i>
        <i className='material-icons' onClick = {makeItalic}>format_italic</i>
        <i className='material-icons' onClick = {makeLineThrough}>strikethrough_s</i>
        <div>
          <i className='material-icons' id = "TCM" style = {{position: "relative"}} onClick = {toggleTextColorMenu}>format_color_text</i>
          {textColorMenu && getTextColorMenu()}
        </div>

        <div><i className='material-icons' id = "BCM" style={{ position: 'relative' }} onClick={toggleBgColorMenu}>format_color_fill</i>
            {bgColorMenu && getColorMenu()}
        </div>
        <div><i className='material-icons' id = "TAM" style={{ position: 'relative' }} onClick={toggleTextAlignMenu}>format_align_left</i>
            {textAlignMenu && getTextAlignMenu()}
        </div>
        <i className='material-icons'>vertical_align_bottom</i>
        <i className='material-icons' onClick = {makeLink}>link</i>
        <i className='material-icons' onClick = {unLink}>link_off</i>
        <i className='material-icons' onClick = {() => setShowFileModal(true)}>attach_file</i>
        <i className='material-icons' onClick = {attachOff}>delete</i>
      </div>
        <div className='toolsBarIconContainer'>
          {panelState ?
            <i className='material-icons' onClick = {()=>setPanelState(false)}>expand_less</i> :
            <i className='material-icons' onClick = {()=>setPanelState(true)}>expand_more</i>}
        </div>
        </> : <><div className='toolsBarIconContainer'>
        <a href="#" className="menu-icon" onClick={()=>setToggle(pre=>!pre)}>&#9776;</a>
            {toggle ? <>
              <div className='toolsBarIconContainer'>
        <i className='material-icons' onClick = {goPre}>undo</i>
        <i className='material-icons' onClick = {goNext}>redo</i>
        <i className='material-icons' onClick = {printDoc}>print</i>
        <i className='material-icons' onClick = {makeDollar}>attach_money</i>
        <i className='material-icons' onClick = {makePercent}>percent</i>
        <i className='material-icons' onClick = {makeNumber}>123</i>
        <i className='material-icons' onClick = {makeString}>abc</i>
        <i className='material-icons' onClick = {decreaseFont}>remove</i>
        <i className='material-icons' onClick = {increaseFont}>add</i>
        <i className='material-icons' onClick = {makeBold}>format_bold</i>
        <i className='material-icons' onClick = {makeItalic}>format_italic</i>
        <i className='material-icons' onClick = {makeLineThrough}>strikethrough_s</i>
        <div>
          <i className='material-icons' id = "TCM" style = {{position: "relative"}} onClick = {toggleTextColorMenu}>format_color_text</i>
          {textColorMenu && getTextColorMenu()}
        </div>

        <div><i className='material-icons' id = "BCM" style={{ position: 'relative' }} onClick={toggleBgColorMenu}>format_color_fill</i>
            {bgColorMenu && getColorMenu()}
        </div>
        <div><i className='material-icons' id = "TAM" style={{ position: 'relative' }} onClick={toggleTextAlignMenu}>format_align_left</i>
            {textAlignMenu && getTextAlignMenu()}
        </div>
        <i className='material-icons'>vertical_align_bottom</i>
        <i className='material-icons' onClick = {makeLink}>link</i>
        <i className='material-icons' onClick = {unLink}>link_off</i>
        <i className='material-icons' onClick = {() => setShowFileModal(true)}>attach_file</i>
        <i className='material-icons' onClick = {attachOff}>delete</i>
        </div>
        <div className='toolsBarIconContainer'>
          {panelState ?
            <i className='material-icons' onClick = {()=>setPanelState(false)}>expand_less</i> :
            <i className='material-icons' onClick = {()=>setPanelState(true)}>expand_more</i>}
        </div>
            </> : ""}
        </div>
        </>}
      
    </div>
    {/* Define Sheet table of Document Page: */}
    <div className = "sheet">
      <table className='sheetTable'>
        <tr className='sheetTableTr'>
          <th></th>
          {alphabet?.map(letters =>{
            return(
              <th onClick={(e)=>changeColor(e)}>
                {letters}
              </th>
            )
          })}
        </tr>
        {data?.map((row, rowIndex) => {
            return(
              <tr className='sheetTableTr'>
                <td onClick={(e)=>changeColor(e)}>{rowIndex + 1}</td>
                {row?.map((col, colIndex) =>{
                  return(
                    <td onClick={(e)=>{changeColor(e); setFocusedCell({rowIndex, colIndex})}} onDoubleClick = {()=>{containValue(rowIndex, colIndex)}}>
                        {selectedCell?.rowIndex == rowIndex && selectedCell?.colIndex == colIndex ?
                        <form onSubmit = {(e)=>onSubmit(e)}>
                          <input type = "text" value = {typeof(inputValue) == 'string' || typeof(inputValue) == Number ? inputValue : col.value} style = {{ textAlign: "center",width: "100%"}} onChange = {(e)=>onChange(e)}/>
                        </form>
                        :
                        getValue(col, rowIndex, colIndex, focusedCell)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
      </table>
    </div>
  </div>
    </>
  )
}
export default DocumentPage


function convertToCSV(data) {
  const header = Object.keys(data[0]).join(","); 
  const rows = data.map(obj => Object.values(obj).join(",")); 
  return header + "\n" + rows.join("\n");
}

function downloadCSV(data, filename) {
  const csv = "\uFEFF" + convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToArray(data){
  //console.log(data)
  return data?.map(q=>{
      return q?.map(p=>{
        if (p.type == 'file'){
          return `https://sheet-backend.iran.liara.run/uploads/${p.value}`;
        }
        else{
          return p.value
        }
      })
  })
}
