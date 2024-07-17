const database = require("../../lib/database")
const utilities = require("../../lib/utilities")
const {ObjectId} = require("mongodb")


const professionalsController = {}

professionalsController.getProfessionals = ("/get-professionals", async (req, res)=>{
    try {
        const payload = req.query
        //get all professionals with the payload
        const professionals = await database.findMany(payload, database.collection.professionals, ["password"], 0).toArray()
        
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {professionals}}, true)

        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
        return
    }
})


professionalsController.getProfessional = ("/get-professional", async (req, res)=>{
    try {
        const payload = req.query

        //get all professionals with the payload
        const professional = await database.findOne(payload, database.collection.professionals, ["password"], 0)
        
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {professional}}, true)

        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
        return
    }
})

professionalsController.setSchedule = ("/set-schedule", async (req, res)=>{
    try {
        const payload = JSON.parse(req.body)
        const userID = req.decodedToken.userID

        if(payload.scheduleType ==  "range"){
            //Break down data
            const schedules = []
            const startDayInt = parseInt(payload.startDay)
            const endDayInt = parseInt(payload.endDay)
            const timeMap = {
                "12AM": 0, "1AM": 1, "2AM": 2, "3AM": 3 , "4AM": 4, "5AM": 5, "6AM": 6,
                "7AM": 7, "8AM": 8, "9AM": 9, "10AM": 10, "11AM": 11, "12PM": 12, "1PM": 13,
                "2PM": 14, "3PM": 15, "4PM": 16, "5PM": 17, "6PM": 18, "7PM": 19, "8PM": 20,
                "9PM": 21, "10PM": 22, "11PM": 23
            }
           
            const startTimeInt = timeMap[`${payload.startTime}${payload.startMeridian}`]
            
            const endTimeInt = timeMap[`${payload.endTime}${payload.endMeridian}`]
            
            for(let d = startDayInt; d <= endDayInt ; d++){
                for(let t = startTimeInt; t <endTimeInt; t++){  
                    const date = new Date();
                    const year = date.getFullYear()
                     const schedule = {professional: ObjectId.createFromHexString(userID), booked: false};
                    schedule.year = year
                    schedule.month = payload.month
                    schedule.day = d
                    schedule.startTime = t;
                    schedule.endTime = t + 1;
                    // schedule.startMeridian = payload.startMeridian
                    // schedule.endMeridian = payload.endMeridian

                    schedules.push(schedule)
                
                }
                
            }
            
            await database.insertMany(schedules, database.collection.schedules)
        
            utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: {msg: "success"}}, true)

        }
        

        
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, responseData: {msg: "server error"}}, true)
        return
    }
})


module.exports = professionalsController
