var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
var fs = require('fs');
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
            return {error: "No Token"};
        }
        return response;
    }catch(error){
        return {error: "Catch error!"};
    }
  }

/* Request for uploading a file: */
router.post('/upload', async (req, res, next) => {
    const { jwtToken } = req.body;
    const XSS = ["js", "php", "cpp", "py", "java", "html"];
    if (!req?.files?.file) {
        res.status(401).json({
            error: "No file has been uploaded"
        })
    }
    const verifyResult = verifyToken(jwtToken);
    if (verifyResult?.decoded?.username) {
        const file = req.files.file;
        const fileExt = file.name.split('.')[1];
        if(XSS.includes(fileExt)){
            res.status(401).json("extension error!");
        }
        else{
            const randId = new Date().getTime().toString(36) + (Math.round(Math.random() * 10000)).toString(36)
            const fileName = randId + "." + fileExt;
            const filePath = `public/uploads/${fileName}`;
            fs.writeFile(filePath, file.data, async (error) => {
                if (error) {
                    res.status(500).json({
                        error: 'Error uploading file'
                    });
                } else {
                    res.status(200).json({
                        fileName
                    });
                }
            });
        }
    }else if (verifyResult?.error) {
        res.status(401).json({ error: 'Token error' })

    } else {
        res.status(401).json({ error: "Not found user!" })
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
  // const ll=new FormData(req.body)
  console.log(req)
});

module.exports = router;