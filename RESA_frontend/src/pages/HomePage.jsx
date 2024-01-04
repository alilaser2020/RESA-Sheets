import React, {useState, useEffect} from 'react';
import Header from "../components/Header";
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { getUserStatus } from '../functions/generalFunctions';

const HomePage = ({num, func}) => {

  const userS = getUserStatus();
  const [data, setData] = useState();
  console.log(userS?.isLogin)
  console.log(data?.user?.role)
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

  return (
    <div className = "home-body">
    <div className = "header-context">
        <Header />
    </div>
      <div className = "homePageContextContainer">
        <div>
          <img className='imageContainer' src="../DocumentPage.png" alt="Invalid image!"/>
        </div>
        <div className='TextContainer'>
            <h1 style={{color: "white"}}>Make data-driven decisions, in Google Sheets</h1>
            <h4 className='w3-opacity' style={{marginTop : "2rem", color: "white"}}>Create and collaborate on online spreadsheets in real-time and from any device.</h4>
          <div className='buttons'>
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
          <div className='questions'>
            <p className='w3-opacity' style={{color: "white"}}>Don't have an account?</p>
            <Link to = "/register/signup">
              <div className='w3-text-blue'>Signup for free</div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default HomePage