const Tag = require("../models/Tags");

exports.createTag = async(req,res) => {

    try{

        // Extract the data from the request body
        const {name , description} = req.body;
        
        // Validation
        if(!name || !description){

            return res.status(400).json({

                success:false,
                message:'All fields are reuired',
            })
        }

        // Create entry in DB
        const tagDetails = await Tag.create({

            name:name,
            description:description,

        });

        console.log('Tag details are: ',tagDetails);
        
        //Return response
        return res.status(200).json({

            success:true,
            message:'Tag created successfully',
        })


    
    } catch(err){

        return res.status(500).json({

            success:false,
            message:err.message,
        }) 
    }
}

// Get all the tags
exports.showAllTags = async(req,res) => {

    try{

        const allTags = await Tag.find({} , {name:true , description:true});
        return res.status(200).json({

            success:true,
            message:'All tags returned successfully',
            allTags
        })


    
    } catch(err){

        return res.status(500).json({

            success:false,
            message:err.message,
        }) 
    }
}