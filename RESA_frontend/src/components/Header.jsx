import React from 'react';
import {useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserStatus } from '../functions/generalFunctions';
import Cookies from 'js-cookie';
// import { UserContext } from '../App';
const Header = () => {
    const userS = getUserStatus();
    const [data, setData] = useState();
    // const {extraData, setExtraData} = useContext(UserContext);
    console.log(data?.user?.isLogin)
    console.log(data?.user?.role)
    const navigate = useNavigate();
    function userStatus(){
        const jwtToken = document.cookie.split("=")[1];
        const query = {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset = UTF-8"
          },
          body: JSON.stringify({
            jwtToken
          })
        };
        fetch("https://sheet-backend.iran.liara.run/users/auth", query)
        .then((response) => response.json())
        .then((data) => {
          if(data?.username){
            setData({
              user: {
                isLogin: true,
                id: data?.id,
                username: data?.username,
                role: data?.role
              }
            })
          }
          else{
            setData({
              user: {
                isLogin: false
              }
            })
          }
        })
    }
    useEffect(()=>{
        userStatus();
      }, []);
    
    function deleteCookies(){
        const cookies = Cookies.get();
        let cookieName;
        for (cookieName in cookies) {
          Cookies.remove(cookieName);
        }
        // setExtraData('');
        navigate("/register/login");
        window.location.reload();
    }

    function refreshPage(){
        window.location.reload();
    }
    return (
    <div>
        <header className = "mainHeader w3-border-bottom">
            <div className = "mainHeaderLeft">
                {/* <div id = "menuBTN" class = "fas fa-bars"></div> */}
                <h3 id = "HP"><Link to = "/" >RESA Sheet</Link></h3>
                <div className = "mainHeaderLeftMenu">
                    {userS?.isLogin ?
                    <>
                        <p><Link to = "/">Home Page</Link></p>
                        {data?.user?.role == "user" ? 
                        <p><Link to = "/user-account">User account</Link></p>:
                        <p><Link to = "/admin-account/admin">Admin account</Link></p>}
                        {/* {data?.user?.role == "admin" ? 
                        <p><Link to = "admin-account">Admin account</Link></p>:
                        <p><Link to = "/"></Link></p>} */}
                        <p onClick = {()=>deleteCookies()}>Log out</p>
                    </> :
                    <>
                        <p onClick = {()=>{refreshPage()}}><Link to = "/register/signup">Sign Up</Link></p>
                        <p onClick = {()=>{refreshPage()}}><Link to = "/register/signin">Sign In</Link></p>
                    </>
                    }
                    {/* {if (sessionStorage.getItem("key") == true) {

                    }} */}
                    {/* <p><Link to = "/document">Documents</Link></p> */}
                </div>
            </div>
            <div className = "mainHeaderRight">
                <div className = 'w3-button w3-blue w3-round'>
                  <a href = "https://workspace.google.com/intl/en/features/?utm_source=sheetsforwork&utm_medium=et&utm_content=trysheetsforwork&utm_campaign=hero" target = "_blank">
                    Try Sheets for Works
                  </a>
                </div>
                {userS?.isLogin ? 
                  <Link to = {`/admin-account/${data?.user?.role}`}>
                    <div className='w3-button w3-text-blue w3-border w3-round'>Go to sheets</div>
                  </Link> : 
                  <Link to = "/">
                    <div className='w3-button w3-text-blue w3-border w3-round'>Go to sheets</div>
                  </Link>
                }
            </div>
        </header>
    </div>
  )
}

export default Header