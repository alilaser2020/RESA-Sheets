var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

var app = express();
app.use(cors({ credentials: true }));
app.options('*', cors({ credentials: true }));

const socketServer = http.createServer(app);
const io = socketIO(socketServer, {
  cors:{
    origin: '*',
    method: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true
  }
});

io.on('connection', (socket)=>{
  console.log("User is connected");
  
  socket.on('disconnect', ()=>{
    console.log("User is disconnected");
  });

  socket.on("docUpdater", (docID)=>{
    console.log(docID);
    io.emit(docID, "Updated");
  })

  socket.on('docVersionUpdater',({docID, data})=>{
    console.log({docID, data})
    io.emit(docID, data)
  })
});

socketServer.listen(3000, ()=>{
  console.log("Socket server is running at port 3000");
});

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(fileUpload({
    createParentPath: true,
    limits: {fileSize: 20 * 1024 * 1024},
    limitHandler: (req, res, next) => {
        next(new MyError('The file you uploaded is more than 20 MB.', 400));
    }
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;