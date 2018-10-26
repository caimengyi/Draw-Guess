# Draw-Guess
一个基于websocket的你画我猜游戏

使用websocket实现服务器自动推送功能，使得多人能同时在线玩耍你画我猜游戏。

使用canvas作为画板，并传递线条数据到服务器，服务器再广播数据。

client1.html和client2.html分别代表两个用户。其实应该可以使用一个页面多次打开代表多个用户，但是由于无法获得各用户的id，因此暂时不能实现。


启动程序：
node server/server.js
