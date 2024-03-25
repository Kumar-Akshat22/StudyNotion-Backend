const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,

    },

    otp:{

        type:String,
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

// Function to send mail
async function sendVerificationMail(email,otp){

    try{

        const mailResponse = await mailSender(email,"Verification mail from StudyNotion",otp);

        console.log('Mail sent successfully:',mailResponse);


    }

    catch(error){

        console.log('Error occured while sending mail:',error);
        throw new error;
    }


}

// Pre Save middleware that sends a verification mail with OTP before saving into the database
OTPSchema.pre('save', async function(next){

    await sendVerificationMail(this.email , this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);