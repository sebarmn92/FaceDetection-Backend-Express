const handleSignin = (req, response, db, bcrypt, logger) => {
    const {email, password} = req.body;
    
        db('login').where({ 
            email : `${email.toLowerCase()}`
        }).then( data => {
            if(data.length !==0 ){
                bcrypt.compare(password, data[0].hash, function(err, res){
                    if(res === true){
                        db('users').where({ 
                                email : `${email.toLowerCase()}`
                            }).then( (data) => {
                                if(data.length !==0 ){
                                    response.status(200).json(data[0]);
                                }
                                else{
                                    response.status(500).json('Something went wrong. Contact system administrator');
                                }
                                
                            }).catch((e) => logger.log({
                            level : 'error',
                            message : e
                        }))
                    } else{
                        response.status(403).json('Incorrect e-mail or password');
                    }
                })
            }
            else{
                response.status(403).json('Incorrect e-mail or password');
            }
        }).catch((e) => logger.log({
                            level : 'error',
                            message : e
                        }))
}

module.exports = {
    'handleSignin' : handleSignin
}