var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

// New Code
var mongo = require('mongodb');
var monk = require('monk');
// var db = monk('mongodb+srv://chenguanyu1995:cgy123824@guanyuplayground.t17bx.mongodb.net/nodetest1?retryWrites=true&w=majority');
var db = monk("mongodb+srv://yichenjia:taZz0GrzG0HjosYc@fiction-landscape.tpago.mongodb.net/trace?retryWrites=true&w=majority");
db.then(() =>{
  console.log("connection success");
}).catch((e)=>{
  console.error("Error !",e);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tracesRouter = require('./routes/traces');

var app = express();
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/traces', tracesRouter);

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
