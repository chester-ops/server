const express = require('express');
const database = require("./lib/database.js")
const router = require("./routes/router.js")
const socketRouter = require("./routes/socketRouter.js")
const webSocket = require("./lib/socket.js") 

const app = express();
const port = process.env.PORT || 5000;
app.use(router)

database.connect(()=>{
    const expressServer = app.listen(port, ()=>{
        console.log(`Server is listening on port: ${port}`)
    })

    webSocket.connect(expressServer)
    socketRouter()
    
})
