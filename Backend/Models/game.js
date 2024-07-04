const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const validator=require('validator');
const question=require('./question');
const gameSchema=new Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['waiting', 'active', 'completed'],
        required: true,
        default:'waiting',
    },
    QuestionArr:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Question',
    }
    ],
  winner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  participanst:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
    }
  ],
  correctAns:[
    {
      type:String,
    }
  ],
  score:{
    type:Number,
    default:-1,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This option will automatically add `createdAt` and `updatedAt` fields
});
//document method
gameSchema.pre('save', async function(next) {
  const num=2;
  try{
  const randomQuestions = await question.aggregate([{ $sample: { size: num } }]);
  const questionIds=randomQuestions.map((q)=>q._id);
  this.QuestionArr=questionIds;
  this.participanst=[this.owner];
  this.correctAns=randomQuestions.map((q)=>q.correctOption);
  next();
  }
  catch(err){
    next(err);
  }
});
//instance method

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;


//owner-667bc800f30999af19ab15fa  id-667be9e713e595fb94ca422d