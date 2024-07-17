const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const Professional = require("../../models/professional")



const professionalAuth = {}

professionalAuth.signup = ("/profesional-signup", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload
        const paylodStatus = utilities.patientSignupValidator(payload, ["firstName", "lastName", "email", "username", "password", "profCode", "gender", "phoneNo", "yoe", "profession"])
        if(paylodStatus.isValid){

            //check if email and username are unique
            const uniqueChecker = await database.checkForExistingUser(payload)

            if(!uniqueChecker.doesUserDetailExist){
                //hash password
                payload.password = utilities.dataHasher(payload.password)

                //save to database
                const savedProfessional = await new Professional(payload).save();

                //add to user collection
                const userData = {
                    primaryID: savedProfessional.insertedId,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNo: payload.phoneNo,
                    email: payload.email,
                    collections: "professionals"
                }
                await database.insertOne(userData, database.collection.users)


                //send response
                utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: "Success"}, true)
                return
            }
            else{
                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `this ${uniqueChecker.userDetail} already exists`}, true)
                return
            }
            
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: paylodStatus.msg}, true)
            return
        }
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: "server error"}, true)
        return
    }
})

professionalAuth.login = ("/professional-login", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload 
        const paylodStatus = utilities.patientSignupValidator(payload, ["email", "password"])
        if(paylodStatus.isValid){
            // check if user exists
            const professional = await database.findOne({email: payload.email}, database.collection.professionals, ["firstName", "profileImg", "email", "password", "role"], 1)

            if(professional){
                //hash password
                payload.password = utilities.dataHasher(payload.password)
                //check if password match
                if(payload.password == professional.password){
                    //create token
                    const token = utilities.jwt("sign", {userID: professional._id.toString(), role: "professional"})
                    
                    //send response
                    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {mpcToken: token, user: professional}}, true)
                    return

                }
                else{
                    utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData: {msg: "invalid username or email"}}, true)
                    return
                }
            }
            else{
                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData: {msg: "invalid username or email"}}, true)
                return
            }
            
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, responseData: {msg: paylodStatus.msg}}, true)
            return
        }
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: "server error"}, true)
        return
    }
})

module.exports = professionalAuth