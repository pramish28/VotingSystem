const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const nodemailer=require('nodemailer');
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
router.post('/approve-student', async (req, res) => {
  const{studentId, email,name}=req.body;
  try {

    console.log("Request received:",studentId, email, name); //debugging
    
    // Find student first to get their email and name
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update isVerified
    student.isVerified = true;
    await student.save();

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,         
      },
    });

    const mailOptions = {
      from: '"Online Voting System" sameerpokhrel2002@gmail.com',
      to: student.email,
      subject: 'Your Registration Has Been Approved',
      html: `
        <p>Dear ${student.name},</p>
        <p>Congratulations! Your registration for the student election system has been approved.</p>
        <p>You can now log in and participate in the election.</p>
        <p>Thank you,<br/>Online Voting System</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Student approved and email sent successfully' });
  } catch (err) {
    console.error('Approval error:', err);
    return res.status(500).json({ error: 'Server error' });
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