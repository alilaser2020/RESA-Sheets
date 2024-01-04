var express = require("express");
var router = express.Router();
const documentModel = require("../modules/documentModel");
const versionModel = require("../modules/versionModel");
const jwt = require("jsonwebtoken");

const secretKey = "MySecretKey";

/* define a function for verification receive token : */
function verifyToken(jwtToken){
    try {
        if (jwtToken){
            var response;
            jwt.verify(jwtToken, secretKey, (error, decoded)=>{
                if(decoded){
                    response = {decoded}
                }else{
                    response = {error}
                }
            })
        }else{
            return {error : "No token!"}
        }
        return response;
    } catch (error) {
        return {error : "Catch error!"}
    }
}

router.post("/create", async(req, res, next)=>{
    const { docID, data, jwtToken } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.id && verifyResult?.decoded?.username){
        try {
          const resultDoc = await documentModel.find({
            docID
          })
          const extractDoc = resultDoc?.[0] || null;
          if(extractDoc?.public ||
            (!extractDoc?.public && (extractDoc?.access?.includes(verifyResult?.decoded?.username) || extractDoc?.creatorID == verifyResult?.decoded?.username))){
              const versionID = new Date().getTime().toString(36) + (Math.round(Math.random() * 10000)).toString(36);
              // console.log({v: versionID})
              const result1 = await versionModel.create({
                  versionID,
                  creatorID: verifyResult.decoded.username,
                  data,
                  creationDate : new Date()
              });
              if(result1){
                  const result2 = await documentModel.findOneAndUpdate({
                      docID
                  }, {
                      $push: {
                          versions: versionID
                      }
                  });
                  if(result2){
                      res.status(200).json({
                          done: true
                      })
                  }else{
                      res.status(401).json({error: "don't update version!"});
                  }
              }else{
                  res.status(401).json({error: "don't create version!"});
              }
          }else{
            res.status(401).json({error: "Don't access to document!"})
          }
        } catch (error) {
            res.status(401).json({error: "Catch error!"});
        }
    }else if(verifyResult?.error){
        res.status(401).json({error: "Token error!"});
    }else{
        res.status(401).json({error: "Not found id!"})
    }
});

router.post('/load', async (req, res, next) => {

  const { docID, jwtToken } = req.body
  const verifyResult = verifyToken(jwtToken)

  try {
    const result1 = await documentModel.find({
      docID
    })

    if (result1) {
      const extractDoc = result1?.[0] || null
      const editable = extractDoc?.access?.includes(verifyResult?.decoded?.username) || extractDoc?.creatorID == verifyResult?.decoded?.username || extractDoc?.editable;
      if(extractDoc?.public ||
         (!extractDoc?.public && (extractDoc?.access?.includes(verifyResult?.decoded?.username) || extractDoc?.creatorID == verifyResult?.decoded?.username))){
          // console.log(extractDoc?.versions)
          if (extractDoc?.versions?.at(-1)) {
          const result2 = await versionModel.find({
            versionID: extractDoc?.versions?.at(-1)
          })
          const lastVersion = result2?.[0] || null

          if (lastVersion) {
            res.status(200).json({
              done: true,
              data: lastVersion?.data,
              versionID: lastVersion?.versionID,
              docName: extractDoc?.name,
              editable
            })
          } else {
            res.status(200).json({
              done: true,
              data: null,
              docName: extractDoc?.name,
              editable
            })
          } 
        } else {
          res.status(200).json({
            done: true,
            data: null,
            docName: extractDoc?.name,
            editable
          })
        }
      } else {
        res.status(200).json({
          done: false,
          data: null,
          editable
        })
      }
    } else {
      res.status(401).json({ err: 'document not found!' })
    }
  } catch (err) {
    next(err)
  }
});

router.post('/delete', async (req, res, next) => {
  console.log("1")
  const { docID, verId, jwtToken } = req.body
  const verifyResult = verifyToken(jwtToken)
  console.log("2")
  const result0 = await documentModel.find({
    docID
  })
  console.log("3")
  let foundDocuments = null
  if (result0) {
    foundDocuments = result0?.[0]
    console.log("4")
  }
  console.log("5")
  if (!foundDocuments) {
    console.log("6")
    res.status(200).json({
      done: false
    })
  }
  console.log("7")
  if (foundDocuments?.public ||
    (!foundDocuments?.public && (foundDocuments?.access?.includes(verifyResult?.decoded?.username) || foundDocuments?.creatorID == verifyResult?.decoded?.username))) {
    console.log("8")
    try {
      const result1 = await documentModel.findOneAndUpdate({
        docID
      }, {
        $pullAll: {
          versions: [verId]
        },
      })
      console.log("9")

      if (result1) {
        console.log("10")
        const result2 = await versionModel.findOneAndDelete({
          versionID: verId
        })
        if (result2) {
          console.log("11")
          res.status(200).json({
            done: true
          })
        } else {
          console.log("12")
          res.status(200).json({
            done: false
          })
        }

      } else {
        console.log("13")
        res.status(401).json({ err: 'document not found!' })
      }
    } catch (err) {
      console.log("14")
      next(err)
    }
  } else {
    console.log("15")
    res.status(200).json({
      done: false
    })
  }
});


module.exports = router;