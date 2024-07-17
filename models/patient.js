const database = require('../lib/database')

class Patient{
    constructor(props){
        this.props = props;
        this.collection = database.db.collection(database.collection.patients)
    }
    save = ()=>{
        
        this.props.addedOn = new Date().toLocaleString()
        return this.collection.insertOne(this.props)  
    }
         
}
    


module.exports = Patient