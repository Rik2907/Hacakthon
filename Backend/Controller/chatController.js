const Chat=require('../Models/Chat.js');
const mongoose=require('mongoose');
const createChat=async(ownerId,userId,gameId)=>{
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return {};
        
      }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {};
        
      }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return {};
        
      }
    try{
       const gid = new mongoose.Types.ObjectId(gameId);
       const uid = new mongoose.Types.ObjectId(ownerId);
       const pid= new mongoose.Types.ObjectId(userId);
       const newChat=new Chat({
        gameId:gid,
        ownerId:uid,
        particpantId:pid
       });
       console.log(newChat);
       await newChat.save()
       if(!newChat)
        throw new Error('Chat not created');
     return {status:'sucess'};
    }catch(err){
        console.log(err);
       return {};
    }
}
module.exports={createChat};
