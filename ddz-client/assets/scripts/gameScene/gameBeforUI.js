import global from './../global'
cc.Class({
    extends: cc.Component,
    properties: {
        readyButton:cc.Node,
        gameStartButton:cc.Node,
        gameBeforUI:cc.Node,
        readyokButton:cc.Node
    },
    onLoad(){

        this.node.on('init',()=>{
            if (global.playerData.houseMangerID === global.playerData.accountID){
                this.readyButton.active = false;
                this.gameStartButton.active = true;
                //this.readyokButton.active = false;
                console.log('gameBeforUI:global houserID = accountID');
            } else {
                this.readyButton.active = true;
                this.readyokButton.active = false;
                this.gameStartButton.active = false;
            }

        });
        global.socket.onGameStart(()=>{
            this.gameBeforUI.active = false;
        });
        global.socket.onChangeHouseManager((data)=>{
            global.playerData.houseMangerID = data;
            if(global.playerData.accountID === data){
                this.readyButton.active = false;
                this.readyokButton.active = false;
                this.gameStartButton.active = true;
            }
        })
    },
    onButtonClick (event,customData){
        switch (customData){
            case 'ready':
                console.log('ready');
                global.socket.notifyReady();
                this.readyButton.active = false;//测试将点击准备后的按钮隐藏掉并替换成已准备图片
                this.readyokButton.active = true;
                break;
            case 'start-game':
                console.log('start game');
                global.socket.requestStartGame((err,data)=>{
                    if(err){
                        console.log('err = ' + err);
                    }else{
                        console.log('game start data = ' + data);
                    }
                });
                break;
            default:
                break;
        }
    },
});














