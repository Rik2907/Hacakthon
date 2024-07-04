const express=require('express');
const router=express.Router();
const gameContoller=require('../Controller/gameController');
const { protect } = require('../Controller/authController');

router.post('/create-game',protect,gameContoller.createGame);
router.get('/all-game',protect,gameContoller.getGame);
//router.post('/join-game',protect,gameContoller.joinGame);
router.get('/get-next/:index/:game_id',protect,gameContoller.getQusetions);
router.post('/check-ans/:index/:game_id',protect,gameContoller.checkans);
router.post('/finishgame',protect,gameContoller.finishgame);
router.post('/getPlayed/:userId',protect,gameContoller.getplayedgames);
module.exports=router;
