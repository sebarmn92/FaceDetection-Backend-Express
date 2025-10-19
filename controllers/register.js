const handleRegister = (req, res, db, bcrypt, logger) => {
    const {email, name, password} = req.body;

    if( !email || !name || !password){
        return res.status(403).json('Please provide all requested data')
    }

    db.transaction( trx => {
    //email must be unique. check before inserting
        trx('users').where({ 
            email : `${email.toLowerCase()}`
        }).then( (data) => {
            if(data.length === 0 ){
                trx('users').insert({ 
                    name: name,
                    email: (email.toLowerCase()),
                    joined: new Date()
                    }).then( () => {
                        //email must be unique. check before inserting
                        trx('login').where({ 
                                            email : `${email.toLowerCase()}`
                                        })
                            .then( (data) => { 
                                if(data.length === 0 ){
                                    bcrypt.hash(password, null, null, function(err, hash){                          
                                        trx('login').insert({
                                                email : (email.toLowerCase()),
                                                hash : hash
                                        }).then(() => {
                                            trx.commit()
                                            res.status(200).json('User registered')
                                        }).catch((e) => {
                                            trx.rollback()
                                            logger.log({
                                            level : 'error',
                                            message : e
                                        })})
                                    })
                                }
                                else{
                                    trx.rollback()
                                    res.status(403).json("Mail already used. Try using a different mail")
                                }
                            }).catch((e) => {
                                trx.rollback()
                                logger.log({
                                level : 'error',
                                message : e
                            })});
                    }).catch((e) => {
                        trx.rollback()
                        logger.log({
                        level : 'error',
                        message : e
                    })});
            }
            else{
                trx.rollback()
                res.status(403).json("Mail already used. Try using a different mail")
            }
        }).catch((e) => {
                trx.rollback()
                logger.log({
                level : 'error',
                message : e
            })})
    })
}

module.exports = {
    'handleRegister' : handleRegister
}