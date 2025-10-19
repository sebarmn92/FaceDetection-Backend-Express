const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const winston = require('winston');
const helmet = require('helmet')

const detectFace = require('./controllers/detectface');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const entries = require('./controllers/entries');

const db = knex({
    client: "pg",
    connection: {
        host: '127.0.0.1',
        port: '5432',
        user: 'postgres',
        password: 'jocking',
        database: 'face_detect_db'
    }
});


const app = express();

app.use(express.json());
app.use(helmet())
app.use(bodyParser.json());
app.use(cors());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});


app.post('/detectface', (req, res) => { detectFace.handleDetectFace(req,res, logger)});
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt, logger)});
app.post('/register', (req, res) =>{ register.handleRegister(req, res, db, bcrypt, logger)});
app.put('/entries', (req, res) => { entries.handleEntries(req, res, db, logger)});


app.listen(3000, () => {
    console.log("running on port 3000");
});
