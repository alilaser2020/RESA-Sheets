export const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

// export const loginChecking = async()=>{
//   const jwtToken = document.cookie.split("=")[1];
//   const query = {
//     method : "POST",
//     headers : {"content-type" : "application/json; charset = UTF-8"},
//     body : JSON.stringify({
//       jwtToken
//     })
//   };

//   if(!jwtToken){
//     window.location.replace("/register/login");
//   }

//   fetch("https://sheet-backend.iran.liara.run/users/auth", query)
//   .then((response)=>response.json())
//   .then((data)=>{
//     if(data?.error){
//       window.location.replace("/register/login");
//     }
//   })
// };

export const adminChecking = async()=>{
  const jwtToken = document.cookie.split("=")[1];
  const query = {
    method : "POST",
    headers : {"content-type" : "application/json; charset = UTF-8"},
    body : JSON.stringify({
      jwtToken
    })
  };

  if(!jwtToken){
    window.location.replace("/register/login");
  }

  fetch("https://sheet-backend.iran.liara.run/users/auth", query)
  .then((response) => response.json())
  .then((data) => {
    if(data?.role != "admin"){
      window.location.replace("/register/login");
    }
  })
};

export const userChecking = async()=>{
  const jwtToken = document.cookie.split("=")[1];
  const query = {
    method : "POST",
    headers : {"content-type" : "application/json; charset = UTF-8"},
    body : JSON.stringify({
      jwtToken
    })
  };

  if(!jwtToken){
    window.location.replace("/register/login");
  }

  fetch("https://sheet-backend.iran.liara.run/users/auth", query)
  .then((response) => response.json())
  .then((data) => {
    if(data?.role != "user"){
      window.location.replace("/register/login");
    }
  })
};

export const getUserStatus = ()=>{
  const jwtToken = document.cookie.split("=")[1];
  var userStatus = {};
  const query = {
    method : "POST",
    headers : {"content-type" : "application/json; charset = UTF-8"},
    body : JSON.stringify({
      jwtToken
    })
  };

  if(!jwtToken){
    userStatus.isLogin = false;
  }else{
    userStatus.isLogin = true;
    fetch("https://sheet-backend.iran.liara.run/users/auth", query)
    .then((response) => response.json())
    .then((data) => {
      if(data){
        userStatus.isLogin = true;
        userStatus.role = data?.role;
      }else{
        userStatus.isLogin = false;
      }
    })
  }
  
  return userStatus
}

export function updateTokens(tokenName, newTokenValue){
  const cookies = document.cookie.split(";");
  for(let i = 0; i < cookies.length; i++){
    const token = cookies[i].trim();
    if(token.startsWith(tokenName + "=")){
      document.cookie = tokenName + "=" + newTokenValue + ";path=/";
      break;
    }
  }
}

export function findToken(name, path){
  const cookies = document.cookie.split(";");
  const filteredTokens = cookies.filter((token) => {
    const [tokenName, tokenValue] = token.split("=");
    return tokenName == name;
  })

  if(filteredTokens.length){
    return filteredTokens[0].split("=")[1];
  }

  return null;
}

export async function auth({data, setData}){
  const jwtToken = findToken("jwtToken", "");
  const query = {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset = UTF-8"
    },
    body: JSON.stringify({
      jwtToken
    })
  };

  await fetch("https://sheet-backend.iran.liara.run/users/auth", query)
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

export function doRedirect(condition, path){
  if(condition) return window.location.replace(path)
}

export function getValue(data, rowIndex, colIndex, focusedCell){
  if(!data?.type && !data?.value) return '';
  let finalValue = '';
  switch(data.type){
    case 'string': finalValue = data.value; break;
    case 'number': finalValue = Number(data.value || 0).toFixed(2); break;
    case 'currency': finalValue = (Number(data.value) || 0).toFixed(2) + "$"; break;
    case 'percent': finalValue = (Number(data.value * 100) || 0).toFixed(2) + "5"; break;
    case 'link': finalValue = (<a href = {data.value} target = "_blank"><i className = "material-icons">link</i></a>); break;
    case 'file' : finalValue = (<a href={`https://sheet-backend.iran.liara.run/uploads/${data.value}`} target="_blank"><i className='material-icons'>attach_file</i></a>); break;
    default: break;
  }
  return(
    <div style = {{
      fontSize: (data?.config?.fontSize || 14 ) + "px",
      fontWeight: data?.config?.isBold || (focusedCell.rowIndex == rowIndex && focusedCell.colIndex == colIndex) ? 'bold' : '400',
      fontStyle: data?.config?.isItalic ? 'italic' : 'normal',
      textDecoration: data?.config?.isLineThrough ? 'line-through' : 'none',
      color: data?.config?.textColor || 'black',
      backgroundColor: data?.config?.backgroundColor || 'white',
      textAlign: data?.config?.textAlign || 'center'
    }}>
      {finalValue}
    </div>
  )
}