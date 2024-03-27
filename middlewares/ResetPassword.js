const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async (req,res,next) => {

    try{
        // Extract the mailId from the request body
        const email = req.body.email;

        // Check whether the user exists in the DB or not
        const user = await User.findOne({email:email});

        if(!user){

            return res.status(400).json({

                success:false,
                message:'Your Email is not registered with us.'
            })
        }

        // Generate the token
        const token = crypto.randomUUID();

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                                {email:email},
                                                {
                                                    token:token,
                                                    resetPasswordExpires:Date.now() + 5*60*1000,
                                                },
                                                {new:true});
        
                                                // create a frontend url
        const url = `http://localhost:3000/update-password/${token}`;

        // Send mail containing the URL
        await mailSender(email , 
                        "Password Reset Link" ,
                        `Password Reset Link: ${url}`,
                        );
        
        // return response
        return res.status(200).json({

            success:true,
            message:'Email sent successfully, check your email and reset your Password'
        });

    } catch(err){

        console.error(err);
        return res.status(500).json({

            success:false,
            message:'Something went wrong while resetting the password'
        })


    }

}

// resetPassword
exports.resetPassword = async(req,res,next) => {

    try{

        // Fetch the data 
        const {password, confirmPassword, token} = req.body;

        // Validation
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Passwords do not match'
            })
        }

        // Fetch the user details from the DB using the token 
        const userDetails = await User.findOne({token:token});

        // If no entry -> Invalid Token
        if(!userDetails){

            return res.status(401).json({

                success:false,
                message:'Token is Invalid',

            })
        }

        // Check the token time 
        if(userDetails.resetPasswordExpires < Date.now() ){

            return res.json({

                success:false,
                message:'Token is expired, Please regenerate the Token'
            })

        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);

        // Update the password into the DB
        await userDetails.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )

        // return response
        return res.status(200).json({

            success:true,
            message:'Password changed Successfully',
            
        })
    
    } catch(err){

        console.error(err);
        return res.status(500).json({

            success:false,
            message:'There was a problem in resetting the password'
        })
    }
}