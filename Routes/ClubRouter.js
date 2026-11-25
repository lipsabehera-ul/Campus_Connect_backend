const clubController = require('../Controllers/ClubController');
const express = require('express');
const ClubRouter = express.Router();
const uploadClub = require('../middleWare/uploadClub');
const MessageController=require('../Controllers/MessageController')

ClubRouter.post('/CreateClub', uploadClub.single('image'), clubController.createClub);
ClubRouter.get('/allClub',clubController.getAllClubs);
ClubRouter.get('/fetchClub/:id',clubController.getClubById);
ClubRouter.post('/joinClub/:studentId/:clubId',clubController.joinClub);
ClubRouter.post('/leaveClub/:studentId/:clubId',clubController.leaveClub);
ClubRouter.delete('/deleteClub/:clubId',clubController.deleteClub);
ClubRouter.post('/reportClub',clubController.reportClub)

ClubRouter.get('/fetchClubs',clubController.fetchAllClubs);
ClubRouter.get('/clubs/:clubId/messages',MessageController.getClubMessage);
ClubRouter.post('/clubs/:clubId/messages',MessageController.sendClubMessage);

module.exports = ClubRouter;