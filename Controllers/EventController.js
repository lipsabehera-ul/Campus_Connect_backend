const EventModel = require("../Models/EventModel");
const RegisterEventModel = require("../Models/RegisterEvent");

exports.createEvent = async (req, res) => {
    const body = req.body;
    const file=req.file;

    if (
        !body.title ||
        !body.description ||
        !body.eventDate ||
        !body.startTime ||
        !body.endTime ||
        !body.venue ||
        !body.organizer ||
        !body.registrationDeadline ||
        !body.maxParticipants ||
        !body.createdBy ||
        !file
    ) {
        return res.status(400).json({
            "message": "All Fields Are Required"
        });
        

    }
    const isValidDate = (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return false;
        }

        const date = new Date(`${value}T00:00:00Z`);

        return !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value;
    };
if (
        !isValidDate(body.eventDate) ||
        !isValidDate(body.registrationDeadline)
    ) {
        return res.status(400).json({
            message: "Please enter valid dates in YYYY-MM-DD format"
        });
    }


    
    
    try {
         const event= await EventModel.create({
            "title": body.title,
            "description": body.description,
            "category": body.category,
            "eventType": body.eventType,
            "eventDate": body.eventDate,
            "startTime": body.startTime,
            "endTime": body.endTime,
            "venue":body.venue,
            "organizer": body.organizer,
            "image": file
               ? `/event/${file.filename}`
               :null,
            "registrationDeadline":body.registrationDeadline,
            "maxParticipants": body.maxParticipants,
            "createdBy": body.createdBy
        });

        return res.status(201).json({
            "message": "Event Created successfully",
            event:event
        });
        
    }catch(error){
        console.error("EVENT ERROR:",error);

        return res.status(500).json({
            message:"Event Creation Failed",
            error:error.message
        });
    }
};

exports.allEvent=async(req,res)=>{
    let event=await EventModel.find().populate('createdBy')
    return res.json(event);
}

exports.deleteEvent=async(req,res)=>{
    const id=req.params.id
    const event=await EventModel.findById(id);
    if(event.status!='completed'&& event.status!='ongoing'&& event.status!='cancelled'){
        await EventModel.findByIdAndDelete(id);
        return res.json({'message':'Event deleteed'})
    }else{
        return res.json({'message':'Unable to deleted event'})
    }
}

exports.registerEvent=async(req,res)=>{
    const eventId=req.body.eventId;
    const userId=req.body.userId;
    const event=await EventModel.findById(eventId);
    const maxParticipants=event.maxParticipants;
    const totalRegister=await RegisterEventModel.find({eventId:eventId});
    if(totalRegister.length==maxParticipants){
        return res.json({'message':'Total seat filledup'})
    }else{
        const isRegister=await RegisterEventModel.findOne({eventId,userId})
        if(isRegister){
            return res.json({'message':'you are already register for the event'})
        }else{
            const reg=await RegisterEventModel.create({eventId:eventId,userId:userId})
            return res.json({'message':'Successfully register for the event'})
        }
        
    }
}