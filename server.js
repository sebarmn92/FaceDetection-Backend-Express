const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const PAT = 'c202b98b870747779bb281dee2f392e6';
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

const db = knex({
    client: "pg",
    connection: {
        host: '127.0.0.1',
        port: '5432',
        user: 'postgres',
        password: 'abcd',
        database: 'face_detect_db'
    }
});


const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id:'123',
            name:'john',
            email:'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {

    res.send('this is working');
});

app.post('/detectface', (req, res) => {
    const {imgurl} = req.body;
    const requestOptions = {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Key ' + PAT
                        },
                        body: JSON.stringify({
                                            "user_app_id": {
                                                "user_id": USER_ID,
                                                "app_id": APP_ID
                                            },
                                            "inputs": [
                                                {
                                                    "data": {
                                                        "image": {
                                                            "url": imgurl
                                                            // "base64": IMAGE_BYTES_STRING
                                                        }
                                                    }
                                                }
                                            ]
                                        })
                    };

     fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
    .then(response => response?.json())
    .then(result => {
      
        console.log(JSON.stringify(result))

        let responseArr = [];
        const regions = result.outputs[0].data.regions;

        regions?.forEach ( region => {
        const boundingBox = region.region_info.bounding_box;

        console.log(region.region_info.bounding_box)

        responseArr.push(
            {
                'topRow' : boundingBox.top_row.toFixed(3),
                'leftCol' : boundingBox.left_col.toFixed(3),
                'bottomRow' : boundingBox.bottom_row.toFixed(3),
                'rightCol' : boundingBox.right_col.toFixed(3)
            }
        );
        })
                    
        res.send(
            JSON.stringify(responseArr)
        );
        }).catch(e => {
        console.log(e);
        res.send(e);
        })
});


app.post('/signin', (req, response) =>{
    const {email, password} = req.body;

    db('login').where({ 
        email : `${email.toLowerCase()}`
    }).then( data => {
        if(data.length){
            bcrypt.compare(password, data[0].hash, function(err, res){
                if(res === true){
                    response.json({
                        userId : data?.id,
                        success: true
                    });
                } else{
                    response.json({
                        userId : 0,
                        success: false
                    });
                }
            })
        }
        else{
            response.json({
                userId : 0,
                success: false
            });
        }
    });

})


app.post('/register', (req, res) =>{
    const {email, name, password} = req.body;

    db('users').where({ 
        email : `${email.toLowerCase()}`
    }).then( data => {
        if(data.length === 0 ){
            db('users').insert({ 
                name: name,
                email: (email.toLowerCase()),
                joined: new Date()
                 }).then( (data) => {
                    if(data.rowCount && data.rowCount !== 0){
                        bcrypt.hash(password, null, null, function(err, hash){
                            
                        db('login').insert({
                                email : (email.toLowerCase()),
                                hash : hash
                        }).then(data => {
                            if(data.rowCount && data.rowCount !== 0){
                                  res.json({
                                      success : true,
                                      error : false
                                  })
                            }
                            else{
                                res.json({
                                    success : false,
                                    error : true
                                })
                            }                         
                        });
    
                    });
                    }
                    else{
                        res.json({
                            success : false,
                            error : true
                        })
                    }
                 });
        }
        else{
            console.log("user already exists")
                res.json({
                        success : false,
                        error : false
                    })
        }
    })

})

app.get('/profile/:id', (req, res) => {
    let userFound = false;
    const { id } = req.params;
    database.users.forEach( user =>{
        if( id === user.id){
            userFound = true;
            res.json(user);
        }
    });

    if(!userFound){
        res.status(404).json('no such user')
    }

})

app.put('/image', (req, res) => {
    let userFound = false;
    const { id } = req.body;
    database.users.forEach( user =>{
        if( id === user.id){
            userFound = true;
            user.entries++;
            res.json(user.entries);
        }
    });

    if(!userFound){
        res.status(404).json('no such user')
    }
})


app.listen(3000, () => {
    console.log("running on port 3000");
});
