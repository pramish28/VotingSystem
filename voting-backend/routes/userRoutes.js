const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const User = require('../models/User');

router.get('/verified', userController.getVerifiedUsers);

router.get('/pending-students',async(req,res)=>{
    try{
        const pendingStudents=await User.find({isVerified:false});
        res.json(pendingStudents);
    }catch(err){
        res.status(500).json({ error: 'Server error'});    }
});


//route to approve students
router.put('/approve-student/:id',async(req,res)=>{
    try{
        const studentId=req.params.id;
        await User.findByIdAndUpdate(studentId, { isVerified: true });
        res.json({success:true,message:'Student approved successfully'});
    }catch(err){
        res.status(500).json({error:'Server error'});
    }
});

//route to reject students

router.delete('/reject-student/:id',async(req,res)=>{
    try{
        const studentId=req.params.id;
        await User.findByIdAndDelete(studentId);
        res.json({success:true,message:'Student rejected successfully'});
    }catch(err){
        res.status(500).json({error:'Server error'});
    }
});


//testing route

router.get('/test', async (req, res) => {
    res.send('test route works');
});

module.exports = router;
// This code defines a route for getting verified users in the voting system backend.