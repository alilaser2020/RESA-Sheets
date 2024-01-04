var express = require("express");
var router = express.Router();
const documentModel = require("../modules/documentModel");
const userModel = require("../modules/userModel");
const versionModel = require("../modules/versionModel");
const jwt = require("jsonwebtoken");

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
            return {error : "No token"};
        }
        return response;
    }catch(error){
        return {error : "Catch error!"};
    }
}

/* Request for create a document : */
router.post("/create", async(req, res, next)=>{
    const { name, public, editable, jwtToken } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        if (!public && editable){
            res.status(401).json({done: false});
        }else{
            try{
                const result = await documentModel.create({
                    docID: new Date().getTime().toString(36) + (Math.round(Math.random() * 10000)).toString(36),
                    name,
                    creatorID: verifyResult?.decoded?.username,
                    public,
                    editable,
                    versions: [],
                    access: []
                });
                if(result){
                    res.status(200).json({
                        done: true
                    });
                }
            }catch(error){
                next(error);
            }
        }
    }else if(verifyResult?.error){
        res.status(401).json({error : "Token error!"});
    }else{
        res.status(401).json("Not found ID");
    }
});

/* Request for load all documents: */
router.post("/load", async(req, res, next)=>{
    const { jwtToken } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        try{
            const result = await documentModel.find({
                creatorID : verifyResult?.decoded?.username
            });
            if(result){
                res.status(200).json({
                    done : true,
                    listDocuments : result
                });
            }else{
                res.status(401).json("Not found document");
            }
        }catch(error){
            next(error);
        }
    }else if(verifyResult?.error){
        res.status(401).json({error : "Token error!"});
    }else{
        res.status(401).json("Not found ID");
    }
});

/* Request for edit a document: */
router.post("/edit", async(req, res, next)=>{
    const { docID, name, public, editable, jwtToken } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        if (public == false && editable == true){
            res.status(401).json("Error to save!")
        }
        try {
            const result = await documentModel.findOneAndUpdate(
            {
                docID,
                creatorID : verifyResult?.decoded?.username
            },
            {
                name,
                public,
                editable
            });
            if(result){
                res.status(200).json({
                    done : true,
                    result
                });
            }else{
                res.status(200).json({
                    done : false,
                    result
                });
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

router.post("/delete", async(req, res, next)=>{
    const {docID, yes, no, jwtToken} = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        try {
            if(yes && no){
                res.status(401).json({error: "Invalid command"})
            }
            else if(yes){
                const result = await documentModel.findOneAndRemove({
                    docID,
                    creatorID: verifyResult?.decoded?.username
                });
                if(result){
                    res.status(200).json({
                        done: true,
                        result
                    });
                }else{
                    res.status(200).json({
                        done: false,
                        result
                    });
                }
            }
            else if(no){
                res.status(200).json({
                  done: false
                });
            }
        } catch (error) {
            next({error : "Catch error!"});
        }
    }else if(verifyResult?.error){
        res.status(401).json({error : "Token error!"});
    }else{
        res.status(401).json("Not found ID");
    }
});

router.post("/giveAccess", async(req, res, next)=>{
    const {docID, access, jwtToken} = req.body;
    verifyResult = verifyToken(jwtToken)
    if(verifyResult?.decoded?.username){
        try {
            const result = await documentModel.findOneAndUpdate({
                docID,
                creatorID: verifyResult?.decoded?.username
            },
            {
                access
            });
            if(result){
                res.status(200).json({
                    done: true,
                    result
                });
            }else{
                res.status(200).json({
                    done: false,
                    result
                });
            }
        } catch (error) {
            next(error);
        }
    }else if(verifyResult?.error){
        res.status(401).json({error : "Token error"});
    }else{
        res.status(401).json({error : "Not found ID"})
    }
});

router.post("/docAccessor", async(req, res, next)=>{
    const { jwtToken, docID } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        try{
            const result = await documentModel.find({
                docID
            });
            if(result){
                const extractDoc = result?.[0] || null
                // console.log(extractDoc?.creatorID);
                // if((extractDoc?.public && !extractDoc?.editable) ||
                // (!extractDoc?.access?.includes(verifyResult?.decoded?.username) && !extractDoc?.creatorID == verifyResult?.decoded?.username)){
                //     res.status(401).json({
                //         done: false,
                //         data: "invalid!"
                //     });
                // }
                // else if((extractDoc?.public && extractDoc?.editable) ||
                // (!extractDoc?.public && (extractDoc?.access?.includes(verifyResult?.decoded?.username) || extractDoc?.creatorID == verifyResult?.decoded?.username))){
                    // console.log(extractDoc);
                    // console.log(verifyResult?.decoded?.username);
                    res.status(200).json({
                        done: true,
                        document: extractDoc,
                        username: verifyResult?.decoded?.username
                });
                // }else{
                    // res.status(200).json({
                    //     done: false,
                    //     document: null
                    // })
                // }
            }else{
                res.status(401).json("Not found document");
            }
        }catch(error){
            next(error);
        }
    }else if(verifyResult?.error){
        res.status(401).json({error : "Token error!"});
    }else{
        res.status(401).json("Not found ID");
    }
});

router.post('/versions/load', async (req, res, next) => {
    const { docID, jwtToken } = req.body
    const verifyResult = verifyToken(jwtToken)
    if (verifyResult?.decoded?.username) {
      try {
        const result = await documentModel.find({
            docID
        })
        const versionList = result?.[0]?.versions.reverse().splice(0,50) || null
        if (versionList) {
          const result2 = await versionModel.find({
            versionID :{$in:versionList}
          })
          res.status(200).json({
            done: true,
            versions: result2
          })
        } else {
          res.status(401).json({ err: 'Not Found!' })
        }
      } catch (err) {
        next(err)
      }
    }
    else if(verifyResult?.err){
        res.status(401).json({ error: 'token error' })
    }else {
      res.status(401).json({ error: 'id not found' })
    }
  });

router.post('/versions/load', async (req, res, next) => {
    const { docID, jwtToken } = req.body
    const verifyResult = verifyToken(jwtToken)
    if (verifyResult?.decoded?.username) {
      try {
        const result = await documentModel.find({
            docID
        })
        const versionList = result?.[0]?.versions.reverse().splice(0,50) || null
        if (versionList) {
          const result2 = await versionModel.find({
            versionID :{$in:versionList}
          })
          res.status(200).json({
            done: true,
            versions: result2
          })
        } else {
          res.status(401).json({ err: 'Not Found!' })
        }
      } catch (err) {
        next(err)
      }
    }
    else if(verifyResult?.err){
        res.status(401).json({ error: 'token error' })
    }else {
      res.status(401).json({ error: 'id not found' })
    }
});

router.post("/edit/name", async(req, res, next)=>{
    const { docID, name, jwtToken } = req.body;
    const verifyResult = verifyToken(jwtToken);
    if(verifyResult?.decoded?.username){
        try {
            const result = await documentModel.findOneAndUpdate(
            {
                docID,
                creatorID : verifyResult?.decoded?.username
            },{
                name,
            });
            if(result){
                res.status(200).json({
                    done: true,
                    name
                });
            }else{
                res.status(200).json({
                    done: false,
                    result
                });
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

module.exports = router;