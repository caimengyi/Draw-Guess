var LINE_SEGMENT = 0;
var CHAT_MESSAGE = 1;
var GAME_LOGIC = 2;

var WAITING_TO_START = 0;
var GAME_START = 1;
var GAME_OVER = 2;
var GAME_RESTART = 3;

var playerTurn = 0;
var wordsList = ["apple","pear","angry","happy","boat","desk"];
var currentGameState = WAITING_TO_START;
var gameOverTimeout;

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 8181 });

wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
        client.send(message);
  });
};

wss.on('connection', function (ws) { 
	var msg = "Welcome to join the party! Total connection: " + wss.clients.size;                   
    var data = {};
    data.dataType = CHAT_MESSAGE;
    data.name = "Server";
    data.message = msg;
    wss.broadcast(JSON.stringify(data));

    var gameLogicData = {};
    gameLogicData.dataType = GAME_LOGIC;
    gameLogicData.gameState = WAITING_TO_START;
    wss.broadcast(JSON.stringify(gameLogicData));

    if(currentGameState == WAITING_TO_START && wss.clients.size >=2){
    	startGame();
    }


    ws.on('message', function (message) {
    	var obj = eval('(' + message + ')');
    	wss.broadcast(JSON.stringify(obj));
    	if(obj.dataType == CHAT_MESSAGE){
    		if(currentGameState == GAME_START && obj.message == currentAnswer){
    			var gameLogicData = {};
    			gameLogicData.dataType = GAME_LOGIC;
    			gameLogicData.gameState = GAME_OVER;
    			gameLogicData.winner = obj.name;
    			gameLogicData.answer = currentAnswer;
    			wss.broadcast(JSON.stringify(gameLogicData));

    			currentGameState = WAITING_TO_START;

    			clearTimeout(gameOverTimeout);
    		}
    	}else if(obj.dataType == GAME_LOGIC && obj.gameState == GAME_RESTART){
    		startGame();
    	}     
    });

});

function startGame(){
	playerTurn = (playerTurn +1) % wss.clients.size;

	var answerIndex = Math.floor(Math.random()* wordsList.length);
	currentAnswer = wordsList[answerIndex];

	var gameLogicData1 = {};
	gameLogicData1.dataType = GAME_LOGIC;
	gameLogicData1.gameState = GAME_START;
	gameLogicData1.isPlayerTurn = false;
	wss.broadcast(JSON.stringify(gameLogicData1));


	var index = 0;
	wss.clients.forEach(function each(client) {
        if(index == playerTurn){
        	var gameLogicData2 = {};
        	gameLogicData2.dataType = GAME_LOGIC;
			gameLogicData2.gameState = GAME_START;
			gameLogicData2.answer = currentAnswer;
			gameLogicData2.isPlayerTurn = true;
			wss.broadcast(JSON.stringify(gameLogicData2));
        }
        index ++;
  	});

  	gameOverTimeout = setTimeout(function(){
  		var gameLogicData = {};
		gameLogicData.dataType = GAME_LOGIC;
		gameLogicData.gameState = GAME_OVER;
		gameLogicData.winner = 'no-one';
		gameLogicData.answer = currentAnswer;
		wss.broadcast(JSON.stringify(gameLogicData)); 	

		currentGameState = WAITING_TO_START;	
  	},60*1000);

  	currentGameState = GAME_START;


}

console.log("Websocket server is running");