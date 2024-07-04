const express=require('express');
const mongoose = require('mongoose');
const app=express();
const ratelimit=require('express-rate-limit');
require('dotenv').config();
const helmet=require('helmet');
const xss=require('xss-clean');
const cors = require('cors');
const mongoSanatize=require('express-mongo-sanitize');
const http = require('http');
const { Server} = require('socket.io');
const server = http.createServer(app);
const {createChat}=require('./Controller/chatController');
const cookieParser = require('cookie-parser');
const authRoute=require('./routes/authRoute');
const quesRoute=require("./routes/quesRoute");
const gameRoute=require("./routes/gameRoute");
const AppError=require('./utils/error');
const globalErrorController=require('./Controller/errController');
const gameContoller=require('./Controller/gameController');
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//sequirity http headers
app.use(helmet());
//limit ammount of data
app.use(express.json({limit:'20Mb'}));

const io = new Server(server,{
  cors: {
      origin:"http://localhost:3000",
      methods:["GET","POST"],
  },
});
const users={};
io.on( "connection" , async ( socket ) =>{
 console.log('io connected sucessfully');
 
 const userId=socket.handshake.query.userId;
 users[userId]=socket.id;
 //console.log(socket.handshake.query.userId,socket.handshake.query.token);
 socket.on('req-join',async({toUserId,gameId,message})=>{
   
  const toSocketId = users[toUserId];
  console.log(toSocketId,users[userId]);
  try{
    const result=await createChat(userId,toUserId,gameId);
    
    if(!result || result.status!=='sucess')
      throw new Error('Couldnot join grp');
   
    //console.log(toSocketId,toUserId,users,gameId);
  
    io.to(toSocketId).emit('res-join',{fromUserId:userId,gameId:gameId,message:'sucess'});
  }catch(err){
    //console.log(err);
    io.to(toSocketId).emit('res-join',{fromUserId:userId,gameId:gameId,message:'faliure'});
  }
  
  console.log(message,userId);
 });

 socket.on('join-grp',async ({toUserId,gameId,message})=>{
  const toSocketId = users[toUserId];
  const ownerId=users[userId];
  console.log(ownerId,toSocketId);
  try{
    const result=await gameContoller.joinGame(toUserId,userId,gameId);
    console.log(result);
    if(!result || !result.status=='sucess')
      throw new Error('Couldnot join grp');
   
  
    io.to(toSocketId).emit('join-the-quizz',{fromUserId:userId,gameId:gameId,message:'sucess'});
    io.to(ownerId).emit('joining',{fromUserId:userId,gameId:gameId,message:'sucess'});

  }catch(err){
    io.to(toSocketId).emit('join-the-quizz',{fromUserId:userId,message:'failure'});
    io.to(ownerId).emit('joining',{fromUserId:userId,message:'failure'});
  }
  
  
  console.log('join-grp');
 });


 socket.on('disconnect', () => {
  if (userId) {
      delete users[userId];
      console.log(`User ${userId} disconnected`);
  }
  });
});
mongoose
  .connect("mongodb://127.0.0.1:27017/quiz?directConnection=true")
  .then(() => console.log("connection sucessful"))
  .catch((err) => console.log(err));

//rate limiter
const limiter=ratelimit({
  max:5000,
  windowMs:60*60*1000,
  message:'Too many request from this Ip'

});
app.use('/api',limiter);

//data sanatization against nosql query injection
app.use(mongoSanatize());//remove $ sign
 
//remove malcious html code
app.use(xss());


//body-parser
app.use("/api/auth",authRoute);
app.use("/api/question",quesRoute);
app.use("/api/game",gameRoute);

app.all('*',(req,res,next)=>{

next(new AppError('Cannot find this Url',404));
});

app.use(globalErrorController);

server.listen(7000,()=>console.log("server is listening"));