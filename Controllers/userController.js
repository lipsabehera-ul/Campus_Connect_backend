const userModel=require('../Models/userModel');
const crypt=require('bcrypt');

exports.createUser=async(req,res)=>{
    const body=req.body;
    if(!body.name || !body.email || !body.password ||!body.phone ||!body.yearOfJoining ||!body.role ){
        return res.json({'message':'all fields are required'})
    }else{
        const newpassword=crypt.hashSync(body.password,10);

        await userModel.create({
            name:body.name,
            email:body.email,
            password:newpassword,
            phone:body.phone,
            yearOfJoining:body.yearOfJoining,
            role:body.role
           
        });
        return res.json({'message':'user created'})
    }
}

exports.loginUser=async(req,res)=>{
    const body=req.body;
    if(!body.email || !body.password){
        return res.json({'message':'email & password require'})
    }else{
        const user=await userModel.findOne({email:body.email})
        if(!user){
            return res.json({'message':'User not found'});
        }else{
            const matchPassword=crypt.compareSync(body.password,user.password);
            if(!matchPassword){
                return res.json({'message':'Invalid Password'});
            }else{
                if(user.status=='inactive'){
                    return res.json({'message':'You are not an active'})
                }else{
                    return res.json(user)
                }
            }
        }
    }
}

exports.allUser=async(req,res)=>{
    const users=await userModel.find({'role':'student'});
    return res.json(users);
}
exports.allFaculty=async(req,res)=>{
    const users=await userModel.find({'role':'faculty'});
    return res.json(users);
}

exports.changeStatus=async(req,res)=>{
    const id=req.params.id;
    
    const user=await userModel.findById(id);
    const status=user.status;
    if(status=='active'){
        await userModel.findByIdAndUpdate(id,{'status':'inactive'});
    }else{
        await userModel.findByIdAndUpdate(id,{'status':'active'})
    }
    return res.json({'message':'Status change successfully'})
}