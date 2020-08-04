var mongoose=require("mongoose");

var commentschema=mongoose.Schema({
    text:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"umodel"
        },
        username: String
    },
    date:{ type: Date, default: Date.now }
});
module.exports=mongoose.model("comment",commentschema);