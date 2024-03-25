const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=>{

    mongoose.connect(process.env.MONGODB_UR , {

    })
    .then(()=>{console.log('DB CONNECTED SUCCESSFULLY')})
    .catch((err)=>{
        console.log('DB CONNECTION FAILED');
        console.error(err);
        process.exit(1);
    })
}