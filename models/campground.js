var mongoose=require("mongoose");

var campgroundschema=new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    category:String,
    price:Number,
    date:{ type: Date, default: Date.now },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"umodel"
        },
        username: String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment"
        }
    ]
});

module.exports=mongoose.model("campground",campgroundschema);
