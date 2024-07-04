const Question=require('../Models/question');
const catchAsync=require('../utils/catchAsync');
const AppError = require('../utils/error');
exports.enterQuestion=catchAsync(async(req,res,next)=>{


    //-console.log("req",req.body);
    const newQuestion=await Question.create({
    question:req.body.question,
    optionA:req.body.optionA,
    optionB:req.body.optionB,
    optionC:req.body.optionC,
    optionD:req.body.optionD,
    correctOption:req.body.correctOption,
    createdBy:req.body.user,
    });
    console.log(newQuestion);
    //console.log(process.env.JWT_SECRET,process.env.JWT_EXPIRES_IN);


    res.status(200).json({
        status:"sucess",
        //token,
        data:{
            User:newQuestion,
        }
    });
})

exports.getAllQuestions=catchAsync(async (req,res,next)=>{
    const userid=req.body.user;
    const questions=await Question.find({createdBy:userid});
    //console.log(questions[0]);
    if(!questions)
        return next(new AppError("Invalid Id",500));
    res.status(200).json({
        status:"sucess",
        data:{
            questions,
        }
    });
})

exports.updateQuestions=catchAsync(async (req,res,next)=>{

const qid=req.params.id;
const questionObj=await Question.findById(qid);
if(!questionObj)
    return next(new AppError("Invalid Id",500));
if(questionObj.createdBy!=req.body.user)
    return next(new AppError("Invalid User",500));
if(req.body.question)
    questionObj.question=req.body.question;

if(req.body.optionA)
    questionObj.optionA=req.body.optionA;

if(req.body.optionB)
    questionObj.optionB=req.body.optionB;

if(req.body.optionC)
    questionObj.optionC=req.body.optionC;

if(req.body.optionD)
    questionObj.optionD=req.body.optionD;
if(req.body.correctOption)
    questionObj.correctOption=req.body.correctOption;
await questionObj.save();

res.status(200).json({
  status:"sucess",
  data:{
    questionObj
  }
});

})

exports.deleteQuestion=catchAsync(async(req,res,next)=>{
    const qid=req.params.id;
    const deletequestion=await Question.findByIdAndDelete(qid);
    if (!deletequestion) {
        return next(new AppError('Question not found' ,401));
    }
    res.json({
        status:"sucess",
        message:"Question deleted sucessfully",
        data:deletequestion,
    });
})

