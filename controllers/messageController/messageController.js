const database = require("../../lib/database")
const {ObjectId} = require("mongodb")
const utilities = require("../../lib/utilities")

const messageController = {}
messageController.getMessages = ("/get-messages", async (req, res)=>{
    try {
        const userID = ObjectId.createFromHexString(req.decodedToken.userID)
        const contactID = ObjectId.createFromHexString(req.query.contactID) 
        //Get all contacts
        const messages = await database.db.collection(database.collection.messages).find(
            {
                $and:[
                    {$or: [{sender: userID}, {sender: contactID}]}, 
                    {$or: [{receiver: userID}, {receiver: contactID}]}
                ]
            }
        ).toArray()

        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {messages}}, true)
          
        
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg:"server error"}}, true)
        return
    }
})
module.exports = messageController