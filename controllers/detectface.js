const PAT = 'c202b98b870747779bb281dee2f392e6'; //should not provide this, but want you to check the app out
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';


const handleDetectFace = (req, res, logger) => {
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
      
        let responseArr = [];
        const regions = result.outputs[0].data.regions;

        regions?.forEach ( region => {
        const boundingBox = region.region_info.bounding_box;

        responseArr.push(
            {
                'topRow' : boundingBox.top_row.toFixed(3),
                'leftCol' : boundingBox.left_col.toFixed(3),
                'bottomRow' : boundingBox.bottom_row.toFixed(3),
                'rightCol' : boundingBox.right_col.toFixed(3)
            }
        );
        })
                    
        res.status(200).send(
            JSON.stringify(responseArr)
        );
        }).catch((e) => {logger.log({
                        level : 'error',
                        message : e
                    })
                    res.status(500).json('Somewhint went wrong. Contact System Administrator')
                })
}

module.exports = {
    'handleDetectFace': handleDetectFace
}