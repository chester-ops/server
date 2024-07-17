const express = require('express')
const router = express.Router()
const path = require("path")

const patientAuthController = require("../controllers/patientController/patientAuthController")
const professionController = require("../controllers/professionController/professionController")
const professionalsController = require("../controllers/professionalsController/professionalsController")
const professionalAuth = require("../controllers/professionalsController/professionalAuth")
const scheduleController = require("../controllers/scheduleController/scheduleController")
const userController = require("../controllers/userController/userController")
const contactsController = require("../controllers/contactsController/contactsController")
const messageController = require("../controllers/messageController/messageController")
const adminAuth = require("../controllers/adminController/adminAuth")
const {bodyParser, isJSON, isProfessional, decodeToken} = require("../lib/middleware")



router.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
    next()
})

//GET STATIC IMAGES
router.use('/multimedia', express.static("multimedia"));


/////////   PATIENTS  ////////////////////
//USER SIGN UP
router.post("/patient-signup", bodyParser, isJSON, patientAuthController.signup)
//USER LOGIN
router.put("/patient-login", bodyParser, isJSON, patientAuthController.login)


/////////   PROFESSIONS  ////////////////////
//GET PROFESSIONS
router.get("/get-professions", professionController.getAll)


/////////   PROFESSIONALS  ////////////////////
//GET PROFESSIONALS BY PROFCODE
router.post("/professional-signup", bodyParser, isJSON, professionalAuth.signup)
router.put("/professional-login", bodyParser, isJSON, professionalAuth.login)
router.get("/get-professionals", professionalsController.getProfessionals)
router.get("/get-professional", professionalsController.getProfessional)
router.post("/set-schedule", bodyParser, decodeToken, isProfessional, isJSON, professionalsController.setSchedule)

/////////   SCHEDULES  ////////////////////
router.get("/get-schedule", scheduleController.getSchedules)
router.get("/get-schedule-time", scheduleController.getTimes)
router.put("/book-appointment", bodyParser, decodeToken, isJSON, scheduleController.bookAppointment)
router.get("/get-booked-appointments", decodeToken, scheduleController.getBookedAppointments)

/////////   USERS  ////////////////////
router.get("/get-user", userController.getUser)

/////////   MESSAGES/CONTACTS  ////////////////////
router.get("/get-contacts", decodeToken, contactsController.getContacts)
router.get("/get-messages", decodeToken, messageController.getMessages)

/////////   ADMINS  ////////////////////

router.put("/admin-login", bodyParser, isJSON, adminAuth.login)


module.exports = router