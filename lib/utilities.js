const crypto = require('crypto')
const jwt = require('jsonwebtoken') 
require('dotenv').config()

const utilities = {}

utilities.isJSON = (data)=>{
    
    try{
        JSON.parse(data)
        return true
    }
    catch{
        return false
    }
}

utilities.setResponseData = (res, status, headers, data, isJSON)=>{
    res.status(status)
    const headerKeys = Object.keys(headers)
    for(let key of headerKeys){
        res.set(key, headers[key])
    }

    if(isJSON){
        res.json(data)
    }
    else{res.send(data)}

    return res.end()
}


utilities.patientSignupValidator = (data, expectedData)=>{
    const emailRegex = /^[a-zA-Z0-9\+\.]+@[a-zA-Z]+\.[a-z]+$/
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9-_]+$/
    const passwordRegex = /^[^\s]{8,15}$/

    const dataKeys = Object.keys(data)
    
    if(dataKeys.length === expectedData.length){
        for(let i of dataKeys){
            if(i === "firstName" && (typeof data[i] !== "string" || data[i].trim().length < 1)){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `${i} should be a string and it should not be empty`
                }
            }

            if(i === "lastName" && (typeof data[i] !== "string" || data[i].trim().length < 1 )){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `${i} should be a string and it should not be empty`
                }
            }

            if(i === "email" && (typeof data[i] !== "string" || !emailRegex.test(data[i].trim()))){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `${i} should be in valid email format`
                }
            }

            if(i === "username" && (typeof data[i] !== "string" || !usernameRegex.test(data[i].trim()))){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `wrong username format, make sure your username starts with an alphabet and must not include any special symbols apart from "-" and "_"`
                }
            }


            if(i === "password" && (typeof data[i] !== "string" || !passwordRegex.test(data[i].trim()))){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `wrong password format, make sure your password is 8 to 15 characters long and contains no spaces`
                }
            }
        }

        return{
            isValid: true,
            errorField: null,
        }

    }
    else{
        return {
            isValid: false,
            msg: `incomplete data or unrequired data detected`
        }
    }
}

utilities.dataHasher = (data)=>{
    if(typeof data == "string" && data.length > 0){

        return crypto.createHmac("sha256", process.env.HASH_STRING).update(data).digest('hex')
    }
    return false
}

utilities.jwt = (operation, data)=>{
    if(operation == 'sign'){
        return jwt.sign(data, process.env.JWT_KEY, {expiresIn: '24h'} )
    }
    if(operation == 'verify'){
        return jwt.verify(data, process.env.JWT_KEY, (err, payload)=>{
            if(err){
                return {isVerified: false}
            }
        
            return {isVerified: true, decodedToken: payload}
        })
    }  
}               


module.exports = utilities