const Club = require('../Models/ClubModel');
const ReportModel=require('../Models/ReportModel')
const mongoose=require('mongoose')

exports.createClub = async (req, res) => {
    try {
        const {
            clubName,
            description,
            category,
            rules,
            createdBy
        } = req.body;

        if (!clubName || !description || !category) {
            return res.status(400).json({
                message: 'Club name, description and category are required'
            });
        }

        const studentId = req.user?._id || createdBy;

        if (!studentId) {
            return res.status(401).json({
                message: 'Login required to create a club'
            });
        }

        const normalizedName = clubName.trim();

        const existingClub = await Club.findOne({
            clubName: {
                $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
                $options: 'i'
            },
            status: 'active'
        });

        if (existingClub) {
            return res.status(400).json({
                message: 'A club with this name already exists'
            });
        }

        const newClub = await Club.create({
            clubName: normalizedName,
            description,
            category,
            rules: rules || '',
            image: req.file ? `/clubs/${req.file.filename}` : '',
            createdBy: studentId,
            members: [studentId]
        });

        return res.status(201).json({
            message: 'Club created successfully',
            club: newClub
        });
    } catch (error) {
        console.error('create club error:', error);
        return res.status(500).json({
            message: 'Unable to create club'
        });
    }
};

exports.getAllClubs=async(req,res)=>{
    try{
        const clubs=await Club.find({
            status:"active"
        })
        .populate("createdBy","name email")
        .populate("members","name email")
        .sort({createdAt:-1});

        return res.status(200).json({
            message:"club fetched successfully",clubs
        });

    }catch(error){
        console.error("get clubs error:",error);

        return res.status(500).json({
            message:"unable to fetch clubs"
        });
    }
};

exports.getClubById = async (req, res) => {
    try {
        const club = await Club.findOne({
            _id: req.params.id,
            status: "active"
        })
        .populate("createdBy", "name email")
        .populate("members", "name email");

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        const studentId = req.query.studentId;
        let hasReported = false;

        if (studentId && mongoose.isValidObjectId(studentId)) {
            hasReported = !!(await ReportModel.findOne({
                clubId: club._id,
                studentId: studentId
            }));
        }

        return res.status(200).json({
            club,
            hasReported
        });

    } catch (error) {
        console.error("Get club error:", error);

        return res.status(500).json({
            message: "Unable to fetch club details"
        });
    }
};

exports.joinClub=async(req,res)=>{
    try{
        const studentId=req.params.studentId;
        const clubId=req.params.clubId;

        if(!mongoose.isValidObjectId(studentId)){
            return res.status(400).json({
                success:false,
                message:"Invalid student Id"
            })
        }

        if(!mongoose.isValidObjectId(clubId)){
            return res.status(400).json({
                success:false,
                message:"Invalid club Id"
              })
            }

            const existingClub=await Club.findOne({
                _id:clubId,
                status:"active"
            });

            if(!existingClub){
                return res.status(404).json({
                    success:false,
                    message:"club not found or inactive"
                });
            }

            if(existingClub.members.some(
                member=>member.toString() ===studentId
            )){
                return res.status(409).json({
                    success:false,
                    message:"You have already joined this club"
                });

            }
            const club=await Club.findByIdAndUpdate(
                clubId,
                {
                    $addToSet:{
                        members:studentId
                    }
                },
                {
                    new:true

                }
            );

            return res.status(200).json({
                success:true,
                message:"You join the club successfully",
                club
            });
    }catch(error){

        console.error("join club error:",error);

        return res.status(500).json({
            success:false,
            message:"Unable to jion club",
            error:error.message
        });
    }
}

exports.leaveClub = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const clubId = req.params.clubId;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid club ID"
      });
    }
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    const club = await Club.findOne({
      _id: clubId,
      status: "active"
    });

    if (!club) {
      return res.status(404).json({
        message: "Club not found"
      });
    }

    if (club.createdBy.toString() === studentId.toString()) {
      return res.status(400).json({
        message: "The club owner cannot leave their own club"
      });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      {
        $pull: {
          members: studentId
        }
      },
      {
        new: true
      }
    );

    return res.status(200).json({
      message: "You left the club successfully",
      club: updatedClub
    });

  } catch (error) {
    console.error("Leave club error:", error);

    return res.status(500).json({
      message: "Unable to leave club"
    });
  }
};

exports.reportClub = async (req, res) => {
    try {
        const { clubId, studentId, reason } = req.body;

        if (
            !mongoose.isValidObjectId(clubId) ||
            !mongoose.isValidObjectId(studentId)
        ) {
            return res.status(400).json({
                message: "Invalid club or student ID"
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: "Please provide a report reason"
            });
        }

        const club = await Club.findOne({
            _id: clubId,
            status: "active"
        });

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        // Check whether student is a member
        const isMember = club.members.some(
            member => member.toString() === studentId
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Only club members can report this club"
            });
        }

        // Club owner cannot report their own club
        if (club.createdBy.toString() === studentId) {
            return res.status(403).json({
                message: "Club owner cannot report their own club"
            });
        }

        // Check duplicate report
        const existingReport = await ReportModel.findOne({
            clubId,
            studentId
        });

        if (existingReport) {
            return res.status(409).json({
                message: "You have already reported this club"
            });
        }

        await ReportModel.create({
            clubId,
            studentId,
            ReportMessage: reason.trim()
        });

        return res.status(201).json({
            message: "Club reported successfully"
        });

    } catch (error) {
        console.error("Report club error:", error);

        return res.status(500).json({
            message: "Unable to report club"
        });
    }
};

exports.deleteClub = async (req, res) => {
  try {
    const reason = req.body.reason;
    const clubId = req.params.clubId;
    const deletedBy=req.body.deletedBy;
    
    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid club ID"
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Please provide a reason for deletion"
      });
    }

    const club = await Club.findOneAndUpdate(
      {
        _id: clubId,
        status: "active"
      },
      {
        $set: {
          status: "deleted",
          deletedBy: deletedBy,
          deletionReason: reason.trim(),
          deletedAt: new Date()
        }
      },
      {
        new: true
      }
    );

    if (!club) {
      return res.status(404).json({
        message: "Active club not found"
      });
    }

    return res.status(200).json({
      message: "Club deleted successfully",
      club
    });

  } catch (error) {
    console.error("Delete club error:", error);

    return res.status(500).json({
      message: "Unable to delete club"
    });
  }
};

exports.fetchAllClubs=async(req,res)=>{
  try{
    const clubs=await Club.find({
      status:"active"
    })
    .populate("createdBy","name email")
    .populate("members","name email")
    .sort({createdAt:-1})
    .lean();

    const reportCounts=await ReportModel.aggregate([
      {
        $group:{
          _id:"$clubId",
          totalReports:{$sum:1}
        }
      }
    ]);
    const reportMap={};

    reportCounts.forEach((report)=>{
      reportMap[report._id.toString()]=report.totalReports;
    });

    const clubsWithReports=clubs.map((club)=>({
      ...club,
      totalReports:reportMap[club._id.toString()]||0
    }));

    return res.status(200).json({
      message:"clubs fetched successfully",
      clubs:clubsWithReports
    });

  }catch(error){
    console.error("Get clubs error:", error);

    return res.status(500).json({
      message:"Unable to fetch clubs"
    });
  }

}
