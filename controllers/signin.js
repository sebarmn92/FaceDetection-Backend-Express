const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const handleSignin = (req, response, db, bcrypt) => {
    const {email, password} = req.body;

    if(!email || !password){
        return Promise.reject('Both e-mail and password must be provided')
    }
    
    return db('login').where({ 
            email : `${email.toLowerCase()}`
        }).then( data => {
            const isValid = bcrypt.compareSync(password, data[0].hash)
            if(isValid){
                return db('users').where({ 
                            email : `${email.toLowerCase()}`
                        }).then( data => data[0])
                            .catch((e) => Promise.reject('unable to get user')
                                )
            } else{
                return  Promise.reject('Wrong credentials')
            }
        }).catch((e) => Promise.reject(e, 'Internal error. Contact administrator'))
}

const getAuthTokenId = () => {
    console.log('auth ok')
}

const signToken = (email) => {
    const jwtPayload = {email};
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: '2 days'})
}

const setToken = () => {
    //store jwt. researching alternativ to redis due to installer not working on windows 11 
}

const createSessions = (user) => {
    //JWT & return user data
    const {id, email} = user;
    const token = signToken(email);
    return {
        'success' : true,
        'userId' : id, 
        token
    }
}

const signinAuthentification = (db, bcrypt) => (req, response) => {
    const {auth} = req.headers;
    
    return auth ? 
    getAuthTokenId() : 
    handleSignin(req, response, db, bcrypt)
    .then((data) => {
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
    })
    .then(session => response.json(session))
    .catch(err => response.status(400).json(err))

}

module.exports = {
    'handleSignin' : handleSignin,
    'signinAuthentification' : signinAuthentification
}