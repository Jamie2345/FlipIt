const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const port = 8080;

const dotenv = require('dotenv')
dotenv.config()

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to mongoose database'))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../client/public')));
app.set('views', path.join(__dirname, '../client/views'));
app.set('view engine', 'ejs');

app.use(cookieParser());

const server = http.createServer(app);

const authenticate = require('./middleware/authenticate')

const AuthRoute = require('./routes/auth')
app.use('/api', AuthRoute)

const CardRoute = require('./routes/cards')
app.use('/api', authenticate, CardRoute)

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/home", authenticate, (req, res) => {
  res.render("home");
});

app.get("/deck/:deckname", authenticate, (req, res) => {
  const name = req.params.deckname
  console.log(name);
  res.render("deck", {name: name});
});

app.get("/review/:deckname", authenticate, (req, res) => {
  const name = req.params.deckname
  console.log(name);
  res.render("recall", {name: name});
});

app.get("/edit/:deckname", authenticate, (req, res) => {
  const name = req.params.deckname
  res.render("edit", {name: name});
});

server.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});