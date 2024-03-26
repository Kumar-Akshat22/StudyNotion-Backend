const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");

// Send OTP
exports.sendOTP = async(req,res) => {

    try{

        // Fetch email from the request body
        const {email} = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({email});

        // If user already exists
        if(checkUserPresent){

            return res.status(401).json({

                success:false,
                message:'User is already registered'
            })
        }

        // Now generate the OTP
        var otp = otpGenerator.generate(6 , {

            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        });

        console.log("OTP->",otp);
        
        // Check whether the OTP is unique 
        let result = await OTP.findOne({otp:otp});

        while(result){

            otp = otpGenerator.generate(6 , {

                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
    
            });

            result = await OTP.findOne({otp:otp});
        }

        // You have got the unique OTP. Now, insert it into the DB
        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log('Details of the Generated OTP:',otpBody);

        return res.status(200).json({

            success:true,
            message:'OTP generated successfully',

        })


    }

    catch(err){

        console.error(err);
        return res.status(500).json({

            success:false,
            message:err.message,
        })


    }

    

}