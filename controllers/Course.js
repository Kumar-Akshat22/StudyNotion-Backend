const Course = require('../models/Course');
const Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// Create course controller
exports.createCourse = async(req,res) => {

    try{

        // Extract the data from req body
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // Get the thimbnail
        const thumbnail = req.files.thumbnailImage;

        // Validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){

            return res.status(400).json({

                success:false,
                message:'All fields are required',
            })
        }

        // Extract the details of the Instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log('Instructor Details : ',instructorDetails);
        //TODO: VERIFY THAT userId AND instructorDetails._id are same of different

        if(!instructorDetails){

            return res.status(404).json({

                success:false,
                message:'Instructor Deatils not found', 
            })
        }

        // Check whether the given tag is valid or not 
        const tagDetails = await Tag.findById(tag);

        if(!tagDetails){

            return res.status(404).json({

                success:false,
                message:'Tag Deatils not found', 
            })
        }

        // Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail , process.env.FOLDER_NAME);

        // Create an entry for new course
        const newCourse = await Course.create({

            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });
        
        // Add this new course to the user schema of the Instructor
        await User.findByIdAndUpdate(
            {
                _id:instructorDetails._id,
            },
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        )

        // TODO: Update the Tag schema

        return res.status(200).json({

            success:true,
            message:'Course created Successfully',
            data:newCourse,

        })
    
    } catch(err){

        return res.status(500).json({

            success:false,
            message:'Failed to create the course',
            error:err.message,
        })

    }
}

// getAllCourses
exports.showAllCourses = async(req,res) => {

    try{

        // find call to the DB
        // TODO: change the below statement incrementally
        const allCourses = await Course.find({})
        
        return res.status(200).json({

            success:true,
            message:'Data for all the courses fetched successfully',
            data:allCourses
        })

    } catch(err){

        return res.status(500).json({

            success:false,
            message:'Cannot fetch courses data',
            error:err.message,
        })

    }
}