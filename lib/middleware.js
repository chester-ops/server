const fs = require('fs')
const path = require('path')
const utilities = require("./utilities")


const middleware = {}

middleware.bodyParser = (req, res, next)=>{
    let buffer = ''
    let exceededDataLimit = false
    req.on('data', (dataStream)=>{

        if(Buffer.byteLength(dataStream, 'utf8') > Math.pow(2, 24)){
            exceededDataLimit = true
        }
        buffer += dataStream
    })

    req.on('end', ()=>{
        if(!exceededDataLimit){
            req.body = buffer
            next()  
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData:'Data sent is too large'}, true ) 
        } 
    })
}

middleware.isJSON = (req, res, next)=>{

    if(utilities.isJSON(req.body)){
        next()
    }
    
    else{    
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData: `Invalid format, payload should be in JSON format`}, true )
    } 
}

middleware.decodeToken = (req, res, next)=>{
    const token = req.headers.authorization.split(' ')[1]
    req.decodedToken = utilities.jwt('verify', token).decodedToken
    next()
}

middleware.isProfessional = async(req, res, next)=>{
    //ectract decoded token
    const decodedToken = req.decodedToken

    if(decodedToken.role === 'professional'){
        next()
    }
    else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData:{msg: `Only professionals can perform this task`}}, true ) 
    }

}



middleware.multimedia = (req, res, next)=>{
    
    const mediaPath = req.path
    const regex = /(?<=\.)[a-zA-Z]+$/
    
    const contentType = 'image/' + mediaPath.match(regex)[0]
    //read file
    fs.readFile(path.join(__dirname, '..', mediaPath), (err, data)=>{
        if(!err && data){
            utilities.setResponseData(res, 200, {'content-type': contentType}, data, false)

        }
        else{
            utilities.setResponseData(res, 404, {'content-type': 'application/json'}, {statusCode: 404, msg: 'file not found'}, true )
        }
    })
}




module.exports = middleware