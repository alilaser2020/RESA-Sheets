var express = require('express');
var router = express.Router();
const userModel = require("../modules/userModel");
const documentModel = require("../modules/documentModel");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const app = express();
const crypto = require('crypto');

const secretKey = "MySecretKey";

/* define a function for verification receive token : */
function verifyToken(jwtToken){
  try{
      if(jwtToken){
          var response;
          jwt.verify(jwtToken, secretKey, (error, decoded)=>{
              if(decoded){
                  response = {decoded};
              }else{
                  response = {error};
              }
          });
      }else{
          return {error: "No token"};
      }
      return response;
  }catch(error){
      return {error: "Catch error!"};
  }
}

router.post('/upload/profile', async (req, res, next) => {
  if (!req?.files?.file) {
      res.status(200).json({
          error: "no file has been uploaded"
      })
  }
  const { jwtToken } = req.body
  const verifyResult = verifyToken(jwtToken)
  if (verifyResult?.err) {
      res.status(401).json({ error: 'token error' })
  } else if (verifyResult?.decoded?.username) {
      const file = req.files.file;
      const fileExt = file.name.split('.')[1];
      const randId = new Date().getTime().toString(36) + (Math.round(Math.random() * 10000)).toString(36)
      const fileName = randId + "." + fileExt;
      const filePath = `public/uploads/${fileName}`;
      fs.writeFile(filePath, file.data, async (error) => {
          if (error) {
              console.error(error);
              res.status(500).json({
                  error: 'Error uploading file'
              });
          } else {
              const result = await userModel.findOneAndUpdate({username: verifyResult?.decoded?.username},{
                  profileImage: fileName
              })
              if(result){
                  res.status(200).json({
                      done: true
                  });
              } else {
                  res.status(401).json({
                      done: false
                  });
              }
          }
      });
  } else {
      res.status(401).json({ error: 'user id not found' });
  }
});


router.post("/read", async(req, res, next)=>{
  const { username, password } = req.body;
  try{
    const result = await userModel.find({
      username,
      password
    });
    if(result){
      res.status(200).json(result);
    }else{
      res.status(401).json({error : "Not found user"});
    }
  }catch(error){
    next(error);
  }
});

/* Request for user register: */
router.post('/signup', async(req, res, next)=>{
  const {username, password, firstName, lastName, email} = req.body;
  try{
    const result = await userModel.create({
      username,
      password: crypto.createHash("sha256").update(password).digest("hex"),
      firstName,
      lastName,
      email,
      status: 1,
      creationDate : new Date(),
      role: "user"
    });

    if(result){
      res.status(200).json({
        done: true
      })
    }
  }catch(error){
    next(error);
  }
});

/* Request for user login: */
router.post('/signin', async(req, res, next)=>{
  const {username, password} = req.body;
  try{
    const result = await userModel.find({
      username,
      password: crypto.createHash("sha256").update(password).digest("hex"),
      status: 1
    });

    const foundUser = {
      id: result?.[0]?.["_doc"]?._id,
      username: result?.[0]?.["_doc"]?.username,
      role: result?.[0]?.["_doc"]?.role
    }

    if(result && result.length != 0){
      const jwtToken = jwt.sign(foundUser, secretKey, {expiresIn: "20m"});
      res.status(200).json({
        jwtToken,
        role: foundUser.role
      });
    } else {
      res.status(401).json({error: "Not found user!"});
    }
  }catch(error){
    next(error);
  }
});

/* Request for user prevent unauthorized entry: */
router.post("/auth", async(req, res, next)=>{
  const {jwtToken} = req.body;
  try{
    if(jwtToken){
      jwt.verify(jwtToken, secretKey, (error, decoded)=>{
        if(decoded){
          res.status(200).json(decoded);
        }else{
          // res.status(401).json(err);
          res.status(401).json({error : "Token is error!"});
        }
      });
    }
  }catch(error){
    next(error);
  }
});

router.post("/loadAll", async(req, res, next)=>{
  try{
    const result = await userModel.find({})
    if(result && result.length != 0){
      res.status(200).json({
        users: result?.map(u=>{
          return u?.username
        })
      });
    }else{
      res.status(401).json({error: "Not found users!"});
    }
  }catch(error){
    next(error);
  }
});

router.post("/replace", async(req, res, next)=>{
  const { username, firstName, lastName, email, password, jwtToken } = req.body;
  const verifyResult = verifyToken(jwtToken);
  if(verifyResult?.decoded?.username){
      try {
          const result1 = await documentModel.updateMany(
          {
              creatorID: verifyResult?.decoded?.username
          },
          {
              creatorID: username
          });
          const hashPassword = crypto.createHash("sha256").update(password).digest("hex");
          const result2 = await userModel.findOneAndUpdate(
          {
              username: verifyResult?.decoded?.username
          },
          {
              username,
              firstName,
              lastName,
              email,
              password: hashPassword
          });
          // const result2 = await userModel.find(
          // {
          //       username : verifyResult?.decoded?.username
          // });
          const foundUser = {
              id: result2?.[0]?.["_doc"]?._id,
              username: result2?.[0]?.["_doc"]?.username,
              role: result2?.[0]?.["_doc"]?.role
          }
          const jwtToken = jwt.sign(foundUser, secretKey, {expiresIn : "20m"});
          if(result1 && result2){
              res.status(200).json({
                  done: true,
                  result2,
                  jwtToken: jwtToken
              });
          }else{
              res.status(200).json({
                  done: false
              });
          }
      } catch (error) {
          next({error: "Catch error!"});
      }
  }else if (verifyResult?.error){
      res.status(401).json({error : "Token error!"});
  }else {
      res.status(401).json("Not found ID");
  }
});

router.post("/reload", async(req, res, next)=>{
  const { username} = req.body;
  // const verifyResult = verifyToken(jwtToken);
  // if(verifyResult?.decoded?.username){
      try {
          const result = await userModel.find(
          {
              username
          });
          // console.log(result);
          const foundUser = {
            id : result?.[0]?.["_doc"]?._id,
            username : result?.[0]?.["_doc"]?.username,
            role : result?.[0]?.["_doc"]?.role
          }
      
          if(result && result.length != 0){
            const jwtToken = jwt.sign(foundUser, secretKey, {expiresIn : "20m"});
            res.status(200).json({
              jwtToken,
              foundUser
            });
          } else {
            res.status(401).json({error : "Not found user!"});
          }
      } catch (error) {
          next({error : "Catch error!"});
      }
  // }else if (verifyResult?.error){
  //     res.status(401).json({error : "Token error!"});
  // }else {
  //     res.status(401).json("Not found ID");
  // }
});

router.post("/userInfo", async(req, res, next)=>{
  const { jwtToken } = req.body;
  const verifyResult = verifyToken(jwtToken);
  if(verifyResult?.decoded?.username){
      try {
          const result = await userModel.find(
          {
              username: verifyResult?.decoded?.username
          });
          console.log(result);
          console.log(result?.[0]?.username);
          if(result && result.length != 0){
            res.status(200).json({
              done: true,
              result
            });
          } else {
            res.status(401).json({error : "Not found user!"});
          }
      } catch (error) {
          next({error : "Catch error!"});
      }
  }else if (verifyResult?.error){
      res.status(401).json({error : "Token error!"});
  }else {
      res.status(401).json("Not found ID");
  }
});

router.post('/list/load', async (req, res, next) => {
  try {
      const result = await userModel.find({});
      if (result && result?.length != 0) {
          res.status(200).json({
              users: result?.map(q => {
                  return {
                      username: q?.username,
                      email: q?.email,
                      creationDate: q?.creationDate,
                      role: q?.role,
                      status: q?.status,
                      id: q?._id
                  }
              })
          });
      } else {
          res.status(401).json({ error: "Not found users!" });
      }
  } catch (error) {
      next(error);
  }
});

router.post('/delete', async (req, res, next) => {
//  res.status(200).json({
//    test: "test"
//  })
  const {name, yes, no, jwtToken} = req.body
  const verifyResult = verifyToken(jwtToken)
  // console.log(verifyResult?.decoded?.username)
  console.log(verifyResult);
  if (verifyResult?.decoded?.username && name) {
    try {
      if(yes && no){
        res.status(401).json({error: "Invalid command"})
      }
      else if(yes){
//        const result1 = await documentModel.findOneAndRemove({
//          creatorID: name
//        });
        const result = await userModel.findOneAndRemove({
            username: name
        });
        if(result){
          res.status(200).json({
            result,
            done: true
          });
        } else {
          res.status(401).json({ error: "Not found user" });
        }
      }
      else if(no){
        res.status(200).json({
          done: false
        });
      }
    } catch (error) {
      next(error);
    }
  } else if (verifyResult?.error) {
    res.status(401).json({ error: 'Token error' });
  } else {
      res.status(401).json({ error: "Not found ID"});
  }
});

router.post('/block', async (req, res, next) => {
  const { jwtToken ,userID} = req.body
  const verifyResult = verifyToken(jwtToken)
  if (verifyResult?.decoded?.username && userID) {
    try {
      const result = await userModel.findOneAndUpdate(
        {
          username: userID
        },
        {
          status: 0
        });
      if(result){
        res.status(200).json({
          result,
          done: true
        });
      } else {
        res.status(401).json({ error: "Not found ID" });
      }
    } catch (error) {
      next(error);
    }
  } else if (verifyResult?.error) {
    res.status(401).json({ error: 'Token error' });
  } else {
      res.status(401).json({ error: "Not found ID" });
  }
});

router.post('/unblock', async (req, res, next) => {
  const { jwtToken, userID} = req.body
  const verifyResult = verifyToken(jwtToken)
  if (verifyResult?.decoded?.username && userID) {
    try {
      const result = await userModel.findOneAndUpdate(
        {
          username: userID
        },
        {
          status: 1
        })
      if(result){
        res.status(200).json({
          result,
          done: true
        })
      } else {
        res.status(401).json({ error: "Not found ID" })
      }
    } catch (error) {
      next(error)
    }
  } else if (verifyResult?.error) {
    res.status(401).json({ error: 'Token error' });
  } else {
      res.status(401).json({ error: "Not found ID" });
  }
});

module.exports = router;