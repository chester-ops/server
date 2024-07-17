const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const Patient = require("../../models/patient")

const patientAuthController = {}


patientAuthController.signup = ("/patient-signup", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload
        const paylodStatus = utilities.patientSignupValidator(payload, ["firstName", "lastName", "email", "username", "password"])
        if(paylodStatus.isValid){

            //check if email and username are unique
            const uniqueChecker = await database.checkForExistingUser(payload)

            if(!uniqueChecker.doesUserDetailExist){
                //hash password
                payload.password = utilities.dataHasher(payload.password)

                //save to database
                const savedPatient = await new Patient(payload).save();

                //add to user collection
                const userData = {
                    primaryID: savedPatient.insertedId,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    collections: "patients"
                }
                await database.insertOne(userData, database.collection.users)

                //create token
                const token = utilities.jwt("sign", {userID: savedPatient.insertedId.toString(), role: "patient"})

                //send response
                utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, mpcToken: token}, true)
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

patientAuthController.login = ("/patient-login", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload 
        const paylodStatus = utilities.patientSignupValidator(payload, ["email", "password"])
        if(paylodStatus.isValid){
            // check if user exists
            const patient = await database.findOne({email: payload.email}, database.collection.patients, ["firstName", "profileImg", "email", "password", "role"], 1)

            if(patient){
                //hash password
                payload.password = utilities.dataHasher(payload.password)
                //check if password match
                if(payload.password == patient.password){
                    //create token
                    const token = utilities.jwt("sign", {userID: patient._id.toString(), role: "patient"})
                    delete patient.password
                    //send response
                    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {mpcToken: token, user: patient}}, true)
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

module.exports = patientAuthController