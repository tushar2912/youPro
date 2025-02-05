import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const ConnectDb = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB Connection Successfull!!!\nDB HOST: ${connectionInstance.connection.host}`)
    }catch(err){
        console.error("ERROR: ", err)
        throw err
        process.exit(1)
    }finally{
        console.log('Process Ended')
    }
}

export default ConnectDb;