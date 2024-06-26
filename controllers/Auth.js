const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

// SignUp
exports.signup = async(req,res)=>{

    try{

        // Fetch the data from the request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber, 
            otp
        } = req.body;

        // Validate the data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){

            return res.status(403).json({

                success:false,
                message:'All fields are required',
            })
        }

        // Match the password and Confirm Password
        if(password !== confirmPassword){

            return res.status(400).json({
                success:false,
                message:'Password and Confirm Password do not match'
            })
        }

        // Check whether the user exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){

            return res.status(400).json({

                success:false,
                message:'User already registered',

            })
        }

        // Now, verification process starts.
        // Find the most recent OTP from the DB
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);
        // The documents are sorted in descending order on the basis of createdAt
        // The sort function here is the function of mongoose which either takes string or object as an input
        // 1 -> Ascending order sorting and -1 -> Descending order sorting 
        // limit(1) -> returns only 1 document from the collection

        if(recentOTP.length === 0){

            // OTP not found
            return res.status(400).json({

                success:false,
                message:'OTP not found',
            })
        } else if(otp !== recentOTP.otp){

            // Invalid OTP
            return res.status(400).json({

                success:false,
                message:'Inavlid OTP',        
            })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);


        const profileDetails = await Profile.create({

            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,

        });
        
        // Create an entry into the DB
        const user = await User.create({

            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname}${lastname}`

        })

        return res.status(200).json({

            success:true,
            message:'User registered successfully',
            user
        })


    }
    catch(err){

        console.error(err);
        return res.status(400).json({
            success:false,
            message:'User cannot be registered. Please try again',
        })
    }
}

// Login
exports.login = async(req,res) => {

    try{

        // Fetch the data from the request body
        const {email , password} = req.body;

        // Validate the data 
        if(!email || !password){

            return res.status(403).json({

                success:false,
                message:'All fields are required. Enter all the fields',

            })
        }

        // Check whether user exists or not 
        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){

            return res.status(401).json({

                success:false,
                message:'User not registered, please sign up first',

            })
        }

        // Match the Password -> Decrypt the password and then match it from the password fetched from request body
        if(await bcrypt.compare(password , user.password)){

            // Generate the JWT token
            const payload = {

                email:user.email,
                id:user._id,
                accountType:user.accountType,

            }

            
            const token = jwt.sign(payload , process.env.JWT_SECRET , {

                expiresIn:"2h"
            });

            user.token = token;
            user.password = undefined;

            // Create a Cookie
            const options = {

                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,

            }

            res.cookie("token",token , options).status(200).json({

                success:true,
                token,
                user,
                message:'User logged In successfully',
            })

        } else{

            return res.status(401).json({

                success:false,
                message:'Password is Incorrect',

            })
        } 


    }

    catch(err){

        console.log(err);
        return res.status(500).json({

            success:false,
            message:'Login Failure, Please LogIn again',
        })
    }
}

// Change Password
// TODO: HomeWork
exports.changePassword = async(req,res) => {

    // Extract the data from the request body
    // oldPassword, newPassword, confirmPassword
    // Validate the passwords
    // Update the new Password into the DB
    // Send mail -> Password Updated
    // Return response
    
}