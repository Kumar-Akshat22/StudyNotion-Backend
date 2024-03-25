const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    name:{

        type:String,
    },

    courseDescription: {
        type:String,
    },

    instructor:{

        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    whatYouWillLearn:{

        type
    },

    courseContent:[
        {

            type:mongoose.Schema.Types.ObjectId,
            ref:'Section',
        }
    ],

    ratingAndReviews: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],

    price:{
        type:Number,
    }
});

module.exports = mongoose.model("Course",courseSchema);