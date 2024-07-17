const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {ObjectId} = require("mongodb")

const scheduleController = {}

scheduleController.getSchedules = ("/set-schedule", async (req, res)=>{
    try {
        
        const profID = req.query.professional
        const month = req.query.month
        const year = parseInt(req.query.year)
        
        
        const scheduleDays = await database.db.collection(database.collection.schedules).aggregate([
            { $match: {$and:[{month: month}, {year: year}, {professional: ObjectId.createFromHexString(profID)}] } }, // Filter for the month of May
            {
              $group: {
                _id: "$day", // Group by the day field
                month: { $first: "$month" }, // Keep the Month field
                originalId: { $first: "$_id" } // Keep the original _id of the first document in the group
              }
            },
            
            {
              $project: {
                _id: "$originalId", // Include the original _id field
                month: 1, // Include the Month field
                day: "$_id" // Include the day field
              }
            },
            { $sort: { day: 1 } }, // Sort by day in ascending order
        ]).toArray()
        
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {appointmentDays: scheduleDays}}, true)
        

    } 
    catch (err) {
          
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
        return
    }
    

})

scheduleController.getTimes = ("/get-schedule-time", async (req, res)=>{
  try {
      
      const profID = req.query.professional
      const month = req.query.month
      const year = parseInt(req.query.year)
      const day = parseInt(req.query.day)
      

      const times = await database.findMany({$and:[{month: month}, {year: year},{day: day}, {professional: ObjectId.createFromHexString(profID)}, {booked: false}]}, database.collection.schedules).toArray()
      
      
      utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {appointmentTimes: times}}, true)
      

  } 
  catch (err) {
        
      utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
      return
  }
  

})

scheduleController.bookAppointment = ("/book-appointment", async (req, res)=>{
  try {
    let scheduleId = JSON.parse(req.body).scheduleId
    scheduleId = ObjectId.createFromHexString(scheduleId)
    const userID = ObjectId.createFromHexString(req.decodedToken.userID)
    //update the schedule
    await database.updateOne({_id: scheduleId}, database.collection.schedules, {booked: true, patient: userID})
    
      
      
    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {msg: "sucess"}}, true)
      

  } 
  
  catch (err) {
        
      utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
      return
  }
  

})

scheduleController.getBookedAppointments = ("/get-booked-appointments", async (req, res)=>{
  try {
    
    let userID = req.decodedToken.userID
    userID =  ObjectId.createFromHexString(userID)
    
   
    //const patients = await database.findMany({$and: [{professional: userID}, {booked:true}]}, database.collection.schedules).toArray()
    const appointments = await database.db.collection(database.collection.schedules).aggregate([
      {$match: {$and: [{professional: userID}, {booked:true}]}},
      {
        $lookup: {
          from: "patients", // The collection to join.
          localField: "patient", // The field from the schedules collection.
          foreignField: "_id", // The field from the patients collection.
          as: "patientData" // The array field that will contain the joined data.
        }
      },
      {
        $unwind: "$patientData" // Unwind the patientData array to deconstruct it.
      },
      {
        $project: {
          "patientData.password": 0, // Exclude the password field.
          // Include any other fields you want from the schedules and patientData.
          // Use 1 for inclusion or 0 for exclusion.
        }
      }
    ]).toArray()


    
    
      
      
    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {bookedAppintments: appointments}}, true)
      

  } 
  
  catch (err) {
        
      utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
      console.log(err)
      return
  }
  

})
module.exports = scheduleController