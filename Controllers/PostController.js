const PostModel=require("../Models/PostModel");

exports.createPost=async(req,res)=>{
    try{
        const {content}=req.body;

        if(!content || !content.trim()){
            return res.status(400).json({
                message:"Post content is required"
            });
        }
        if(!["student","faculty"].includes(req.user.role)){
            return res.status(403).json({
                message:"You cannot create posts"
            });
        }
        const post =await PostModel.create({
            content:content.trim(),
            image:req.file?`/posts/${req.file.filename}`:"",
            createdBy:req.user._id
        });
        const result=await post.populate(
            "createdBy","name email role"
        );

        res.status(201).json({
            message:"post created successfully",
            post:result
        });
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
};


exports.allPost=async(req,res)=>{
   try{
    const posts=await PostModel.find()
    .populate('createdBy', "name email role")
    .populate("likes", "name")
    .populate("comments.user","name role")
    .sort({createdAt:-1});
    res.json(posts);
   }catch(error){
    res.status(500).json({
        message:error.message
    });
   }
};


exports.onepost=async(req,res)=>{
    try{
        const id=req.params.id;
        const posts=await PostModel.findById(id)
        res.json(posts);
    }catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}

exports.editPost=async(req,res)=>{
    try{
        const{content}=req.body;
        const post=await PostModel.findById(req.params.is);
        if(!post){
            return res.status(404).json({
                message:"Post not found"
            });
        }
        if(post.createdBy.toString() !==req.user._id.toString()){
            return res.status(403).json({
                message:"You can edit only your own post"
            });
        }
        if(!["student","faculty"].includes(req.user.role)){
            return res.status(403).json({
                message:"Permission denied"
            })
        }
        if(!content || !content.trim()){
            return res.status(400).json({
                message:"Content is required"
            });
        }

        post.content=content.trim();
        await post.save();
        res.json({
            message:"Post updated successfully",
            post
        });

    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
}


exports.deletePost=async(req,res)=>{
    try{
        const post=await PostModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                message:"Post not found"
            });
        }
        const isAdmin=req.user.role=="admin";
        const isOwner=post.createdBy.toString()===req.user._id.toString();

        if(!isAdmin && !isOwner){
            return res.status(403).json({
              message:"You cannot delete this post"
            });
        }
        
        await PostModel.findByIdAndDelete(req.params.id);
        return res.json({
            message:"post delted successfully"
        });

    }catch(error){
       return res.status(500).json({
            message:error.message
        });
    }
}
