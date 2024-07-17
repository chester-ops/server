
const database = require("../../lib/database")
const utilities = require("../../lib/utilities")

const adminAuth = {}

adminAuth.login = ("/admin-login", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)

        //Validate payload 
        const paylodStatus = utilities.patientSignupValidator(payload, ["email", "password"])
        if(paylodStatus.isValid){
            // check if user exists
            const admin = await database.findOne({email: payload.email}, database.collection.admins)

            if(admin){
                //hash password
                payload.password = utilities.dataHasher(payload.password)
                //check if password match
                if(payload.password == admin.password){
                    //create token
                    const token = utilities.jwt("sign", {userID: admin._id.toString(), role: "admin"})
                    delete admin.password
                    //send response
                    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {mpcToken: token, user: admin}}, true)
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

module.exports = adminAuth