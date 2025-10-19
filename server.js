const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const winston = require('winston');
const helmet = require('helmet')
const dotenv = require('dotenv')

dotenv.config()

const detectFace = require('./controllers/detectface');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const entries = require('./controllers/entries');

const db = knex({
    client: "pg",
    connection: {
        host: process.env.HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
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
app.post('/signin', signin.signinAuthentification(db, bcrypt));
app.post('/register', (req, res) =>{ register.handleRegister(req, res, db, bcrypt, logger)});
app.put('/entries', (req, res) => { entries.handleEntries(req, res, db, logger)});


app.listen(3000, () => {
    console.log("running on port 3000");
});
