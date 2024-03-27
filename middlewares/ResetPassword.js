const User = require("../models/User");
const mailSender = require("../utils/mailSender");

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

