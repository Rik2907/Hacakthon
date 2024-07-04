const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/error');
const Game=require('../Models/game');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
exports.createGame=catchAsync(async(req,res,next)=>{

    const user_id=req.body.user;
    const newGame=new Game({
        owner:user_id,
        participants:user_id,
    });
    //console.log(newGame)
    await newGame.save();
    res.status(200).json({
        status:'sucess',
        data:{
           game: newGame,
        }
    });
    //next();
    
});
exports.joinGame=async(toUserId,userId,gameId)=>{
    

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return {};
        
      }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {};
        
      }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return {};
        
      }
     //console.log("Yes");
      // Convert to ObjectId
      try{
      const gid = new mongoose.Types.ObjectId(gameId);
      const uid = new mongoose.Types.ObjectId(userId);
      const pid= new mongoose.Types.ObjectId(toUserId);
     
     
      const updatedGame = await Game.findOneAndUpdate(
        { _id: gameId}, 
        { $push: {participanst: toUserId}, $set: { status: 'active' } }, 
        { new: true } // Return the updated document
      );
      console.log(updatedGame);
      if (!updatedGame) {
        return {};
      }
      return {status:'sucess'};
    }catch(err){
        return {};
    }
    
}
exports.getGame=catchAsync(async(req,res,next)=>{

    const gameAvailable=await Game.find({status:'waiting'}).select('owner _id');;
    if(!gameAvailable)
        next(new AppError('No game available',404));
    
    res.status(200).json({
        status:'sucess',
        game:gameAvailable
    });

});
exports.getQusetions=catchAsync(async(req,res,next)=>{

    const {index,game_id}=req.params;
    
    //var score=0;
    const question=await Game.findById(game_id,"QuestionArr").populate("QuestionArr");
    //console.log(correct);

    if(!question)
        return next(new AppError("Game id invalid",404));

    if(!index ||index>=question.length||index<0)
        return next(new AppError("Invalid index",404));

    
    const curr=question.QuestionArr[index];
    console.log("curr",curr);
    res.status(200).json({
        status:"sucess",
        question:{
            question:curr.question,
            option:[curr.optionA,curr.optionB,curr.optionC,curr.optionD],
            correctOption:curr.correctOption,
        }
    })
});
exports.checkans=catchAsync(async(req,res,next)=>{
 
    const {index,game_id}=req.params;
    const {correct}=req.body;
    var score=0;
    const correctAns=await Game.findById(game_id,"correctAns");
    
    if(!correctAns)
        return next(new AppError("game-id invalid",404));

    if(!index ||index>=correctAns.length||index<0)
        return next(new AppError("Invalid index",404));
    
    //console.log(correct,correctAns.correctAns[index],correctAns,correct===correctAns.correctAns[index]);
    if(correct===correctAns.correctAns[index])
        score+=5;


    return res.status(200).json({
        status:"sucess",
        points:score,
    });
});
exports.finishgame=catchAsync(async(req,res,next)=>{
    let{ gameId ,newScore,userId}=req.body;

    gameId=new mongoose.Types.ObjectId(gameId);
    userId=new mongoose.Types.ObjectId(userId);
    newScore=Number(newScore);
    console.log(userId,gameId,newScore);
    const updatedGame = await Game.findOneAndUpdate(
        { _id: gameId },
        [
          {
          $set: {
              winner: {
                $cond: {
                  if: { $eq: ['$score', -1] },
                  then: userId,
                  else: {
                    $cond: {
                      if: { $lt: ['$score', newScore] },
                      then: userId,
                      else: '$winner',
                    },
                  },
                },
              },
              status: {
                $cond: {
                  if: { $eq: ['$score', -1] }, 
                  then: '$status',
                  else: 'completed',
                },
              },
              score: {
                $cond: {
                  if: { $eq: ['$score', -1] },
                  then: newScore,
                  else: {
                    $cond: {
                      if: { $lt: ['$score', newScore] },
                      then: newScore,
                      else: '$score',
                    },
                  },
                },
              },
            },
          },
          ],
        { new: true }
  );
  if(!updatedGame)
    return next(new AppError("Invalid Game",404));

  console.log(updatedGame);
  res.status(200).json({
    status:'sucess',
    gamestatus:updatedGame.status,
    winner:updatedGame.winner,
    score:updatedGame.score,
  });
       
});
exports.getplayedgames=catchAsync(async(req,res,next)=>{
  const {userid}=req.params;
  const game= await Game.find({ 
    participants: userid, 
    status: 'completed' 
  });
  res.status(200).json({
    status:'sucess',
    winner:game.winner,
  });
});
// module.exports={
//     joinGame,
// }
// user_id:66730da1051b7ad63de47f5f
//owner_id:667bc800f30999af19ab15fa
//game-id:667db135f2e16194f9075e35