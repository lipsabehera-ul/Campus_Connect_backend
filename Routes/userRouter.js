const userController=require('../Controllers/userController');
const EventController=require('../Controllers/EventController')
const uploadEvent=require('../middleWare/uploadEvent')
const express=require('express');
const userRouter=express.Router();
const RegisterEvent=require('../Models/RegisterEvent')

userRouter.post('/createUser',userController.createUser);
userRouter.post('/loginUser',userController.loginUser);

userRouter.get('/allUser',userController.allUser);
userRouter.get('/allFaculty',userController.allFaculty);


userRouter.get('/changeStatus/:id',userController.changeStatus);
userRouter.post('/createEvent',uploadEvent.single('image'),EventController.createEvent)
userRouter.get('/allEvent',EventController.allEvent);
userRouter.delete('/deleteEvent/:id',EventController.deleteEvent)
userRouter.post('/registerEvent',EventController.registerEvent)

module.exports=userRouter