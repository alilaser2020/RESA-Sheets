var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

var app = express();
app.use(cors({ credentials: true }));
app.options('*', cors({ credentials: true }));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var documentsRouter = require('./routes/documents');
var versionsRouter = require('./routes/versions');

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(fileUpload({
    createParentPath: true,
    limits: {fileSize: 400 * 1024 * 1024},
    limitHandler: (req, res, next) => {
        next(new MyError('The file you uploaded is more than 400 MB.', 400));
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/documents', documentsRouter);
app.use('/versions', versionsRouter);

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

const mongoose = require("mongoose");
//url = "mongodb://root:xSiqD752XXiorFRhXthjzIVz@michael.iran.liara.ir:31231/CBSSP-DataBase?authSource=admin"
mongoose.connect("mongodb://root:xSiqD752XXiorFRhXthjzIVz@michael.iran.liara.ir:31231/CBSSP-DataBase?authSource=admin", {
  useNewUrlParser:true
}).then(()=>{
  console.log("Connected to the Data-base successfully.");
}).catch((err)=>{
  console.log(err);
});

module.exports = app;