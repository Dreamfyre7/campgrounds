var mongoose=require("mongoose");

var passportlocalmongoose=require("passport-local-mongoose");

var userschema=new mongoose.Schema({
    name:String,
    fullname:String,
    password:String,
    email:String,       
    number:Number,
    display:String,
    dob:Date,
    joined:{ type: Date, default: Date.now },
    bio:String,
    gender:String,
    campgrounds:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"campground"
        }
    ]
});
userschema.plugin(passportlocalmongoose);
module.exports=mongoose.model("umodel",userschema);
