const database = require("../../lib/database")
const {ObjectId} = require("mongodb")
const utilities = require("../../lib/utilities")
const userController = {}

userController.getUser = ("/get-user", async (req, res)=>{
    try{
        const userID = ObjectId.createFromHexString(req.query.userID)
        //get user
        const user = await database.findOne({primaryID: userID}, database.collection.users)
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {userData: user}}, true)

    }
    catch (err) {
        
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
        console.log(err)
        return
    }

})

module.exports = userController