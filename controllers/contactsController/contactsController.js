const database = require("../../lib/database")
const {ObjectId} = require("mongodb")
const utilities = require("../../lib/utilities")

const contactsController = {}
contactsController.getContacts = ("/get-contacts", async (req, res)=>{
    try {
        const userID = ObjectId.createFromHexString(req.decodedToken.userID) 
        //Get all contacts
        const contacts = await database.db.collection(database.collection.messages).aggregate([
            {
              $match: {
                $or: [
                  { sender: userID },
                  { receiver: userID }
                ]
              }
            },
            {
              $sort: { _id: -1 }
            },
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $eq: ["$sender", userID] },
                    then: "$receiver",
                    else: "$sender"
                  }
                },
                latestMessage: { $first: "$$ROOT" }
              }
            },
            {
              $replaceRoot: { newRoot: "$latestMessage" }
            },
            {
              $lookup: {
                from: "users",
                let: {
                  user_id: {
                    $cond: {
                      if: { $eq: ["$receiver", userID] },
                      then: "$sender",
                      else: "$receiver"
                    }
                  }
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$primaryID", "$$user_id"]
                      }
                    }
                  }
                ],
                as: "contactInfo"
              }
            },
            {
              $unwind: {
                path: "$contactInfo",
                preserveNullAndEmptyArrays: true // This will include the messages even if the user info is not found
              }
            },
            {
              $sort: { _id: -1 }
            }
          
            // You can add other stages like $project to shape the output as needed
        ]).toArray()

        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {contacts}}, true)
          
        
        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg:"server error"}}, true)
        return
    }
})
module.exports = contactsController