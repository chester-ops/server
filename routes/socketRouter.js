const webSocket = require("../lib/socket") 
const database = require("../lib/database")
const {ObjectId} = require("mongodb")

const activeUsers = []

const socketRouter = ()=>{
    
    webSocket.io.on("connection", socket=>{
        //check if user is already in the active users list
        
        socket.on("addActiveUser", async (userID)=>{    
            let newUser = await database.findOne({primaryID: ObjectId.createFromHexString(userID)}, database.collection.users)
            if(!newUser) return
            newUser = {
                primaryID: userID, firstName: newUser.firstName, lastName: newUser.lastName, 
                profileImg: newUser.profileImg, socketID: socket.id
            }

            const userIndex = activeUsers.findIndex((user) => user.primaryID === userID);
            if(userIndex === -1){
                activeUsers.push(newUser)
            }
            else{
                activeUsers.splice(userIndex, 1);
                activeUsers.push(newUser)
            } 

        })
        
        socket.on("message", async data=>{
            //send to messages collection
            const databaseCopy = {...data}
            databaseCopy.sender = ObjectId.createFromHexString(data.sender)
            databaseCopy.receiver = ObjectId.createFromHexString(data.receiver)

            await database.insertOne(databaseCopy, database.collection.messages)
            const receiver = activeUsers.find(receiver=> receiver.primaryID === data.receiver)
            if(receiver){
                const senderDetails = activeUsers.find(sender=> sender.primaryID === data.sender)
                data.contactInfo = senderDetails
                
                webSocket.io.to(receiver.socketID).emit("message", data)
            }
           
        })
        socket.on("removeActiveUser", (userID, callback)=>{
            
            const indexOfUser = activeUsers.findIndex(user=>{
                return user.primaryID == userID
            }) 
            if(indexOfUser > -1){
                activeUsers.splice(indexOfUser, 1)
                callback()
            }
        })

    }) 
}


module.exports = socketRouter
