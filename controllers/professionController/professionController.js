const database = require("../../lib/database")
const utilities = require("../../lib/utilities")

const professionController = {}


professionController.getAll = ("/get-professions", async (req, res)=>{
    try {
        //get all professions
        const allProfessions = await database.findMany({}, database.collection.professions).toArray()
             
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, responseData: allProfessions}, true)
            
       // utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `this ${uniqueChecker.userDetail} already exists`}, true)
                
    
    } 
    catch (err) {
        console.log(err)    
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: "server error"}, true)
        return
    }
})


module.exports = professionController