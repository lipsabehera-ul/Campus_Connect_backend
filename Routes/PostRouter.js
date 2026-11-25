const PostController=require('../Controllers/PostController');
const uploadPost=require('../middleWare/uploadPost');

const express=require('express')
const PostRouter=express.Router()

PostRouter.post('/CreatePost',uploadPost.single('image'),PostController.createPost);
PostRouter.get('/allPost',PostController.allPost);
PostRouter.get('/onePost',PostController.onepost);
PostRouter.put('/editPost/:id',PostController.editPost);
PostRouter.delete('/deletePost/:id',PostController.deletePost)

module.exports=PostRouter