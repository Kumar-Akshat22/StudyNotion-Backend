import jwt from "jsonwebtoken";
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async(req,res,next) => {

    try{

        // Extract the token
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ","")

        // If token missing, then return response
        if(!token){

            return res.status(401).json({

                success:false,
                message:'Token is Missing',

            });
        }

        // Token found, then verify the token
        try{

            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;

        } catch(err){

            // Verification issue
            return res.status(401).json({
                
                success:false,
                message:'Token is Invalid',

            })
        }

        next();
    }

    catch(err){

        return res.status(401).json({

            success:false,
            message:'Something went wrong while validating the token',
            
        })

    }
}

// isStudent

// isAdmin