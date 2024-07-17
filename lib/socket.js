const {Server} = require("socket.io")

class WebSocket{
    constructor(){
        this.io;
        this.socket;
        
    }
    connect = async (httpServer)=>{
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-type', 'Authorization']
    
            }
        })
    
    }
}


const webSocket = new WebSocket()

module.exports = webSocket