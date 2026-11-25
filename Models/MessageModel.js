const mongoose=require("mongoose");

const messageSchema=new mongoose.Schema(
    {
        clubId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"club",
            required:true
        },
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true
        },
        message:{
            type:String,
            required:true,
            trim:true,
            maxlength:2000
        }
    },
    {
        timestamps:true
    }
)
const messagemodel=mongoose.model('message',messageSchema)
module.exports=messagemodel