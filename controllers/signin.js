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

const getAuthTokenId = (req, res, db) => {
    const {authorization} = req.headers;

    return db('auth').where('token', authorization).then((data) => {
        if((data.length === 1) && (data[0].token == authorization)){
            return db('users').where('email', data[0].email.toLowerCase()).then( (data) => { return data[0] } ).catch(err => Promise.reject(err))
        }else{
            return Promise.reject(res.status(400).json('unauthorized'))
        }
    }).catch(err => Promise.reject(err))
}

const signToken = (email) => {
    const jwtPayload = {email};
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: '2 days'})
}

const createSessions = (user,db) => {
    //JWT & return user data
    const {id, email} = user;
    const token = signToken(email);

    return db('auth').where('email', email.toLowerCase()).del(['email', 'token'], {includeTriggerModification : true}).then(() =>{
        return db('auth').insert({
                    'email' : email,
                    'token' : token
                    }).then(() =>{
                            return {
                                    'success' : true,
                                    'profile' : user, 
                                    token
                                }
                    }).catch(err => Promise.reject(err))
    }).catch(err => Promise.reject(err))
}

const signinAuthentification = (db, bcrypt) => (req, response) => {
    const {authorization} = req.headers;

    return authorization ? 
    getAuthTokenId(req, response, db).then((data) =>  { response.json(data) } ).catch(err => Promise.reject(err) ) : 
    handleSignin(req, response, db, bcrypt)
    .then((data) => {
        return data.id && data.email ? createSessions(data,db) : Promise.reject(data)
    })
    .then(session => response.json(session))
    .catch(err => response.status(400).json(err))

}

module.exports = {
    'handleSignin' : handleSignin,
    'signinAuthentification' : signinAuthentification
}