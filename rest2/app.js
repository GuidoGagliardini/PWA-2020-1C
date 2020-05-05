var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
// CORS Policy
// valida el token y protege las rutas
const jwt = require('jsonwebtoken');
const fs = require('fs');

dotenv.config(); // leer el archivo .env
var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const panelRouter = require('./routes/panel');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const secured = async (req,res,next) => {

  try {
    // Bearer | JWT 
    // JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTg4NjgxNDA3LCJleHAiOjE1ODg2ODg2MDd9.sQu8727BVCiKIZA72HLknQ9KOChO-OID4n6w3z5IkWu5oKQgIUaT2ZcjPF-CeZ_Vq5VsuIyxoJmoePnozdP_AyjyajYfi4sibE-5LYnPF8Q4HFfISlu0GY1rLCxs86T1rRlEsmhcTRkWlSS0K8Vph5kMPKZXxkr-ElJS2QtAn8g
    // replace
    let token = req.headers.authorization; // token que envia el usuario
    console.log(`Cabeceras : ${token}`);
    token = token.replace('Bearer ','');
    const publicKey = fs.readFileSync('./claves/publica.pem');
    let decoded = jwt.verify(token,publicKey);
    next(); // break // return
  } catch(error) {
    console.log(error);
    res.status(401).json({status : false, message : 'unauthorized'})
  }
}

app.use('/', indexRouter);
app.use('/auth',authRouter);
app.use('/users',userRouter);
// middleware -> funciones de ruta (cargar un archivo si y solo si se verifica la funcion middleware)
app.use('/panel',secured,panelRouter)

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
