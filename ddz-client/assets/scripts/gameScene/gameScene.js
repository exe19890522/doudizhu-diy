import global from './../global'
cc.Class({
    extends: cc.Component,
    properties: {
        bottomLabel: cc.Label,
        rateLabel: cc.Label,
        roomIDLabel: cc.Label,
        playerNodePrefab: cc.Prefab,
        playerPosNode: cc.Node
    },
     onLoad(){
         this.playerNodeList = [];
         this.bottomLabel.string = '底分:' + global.playerData.bottom;
         this.rateLabel.string = '倍数:' + global.playerData.rate;
         global.socket.requestEnterRoomScene((err, data)=>{
            if (err){
                console.log('err = ' + err);
            }else {
                 console.log('gamescene:enter room scene = ' + JSON.stringify(data));
                 //let seatIndex = data.seatIndex;
                 this.playerPosList = [];
                 this.initPlayerPos(data.seatIndex);
                 let playerData = data.playerData;
                 let roomID = '房号：' + data.roomID;
                 this.roomIDLabel.string = roomID;
                 global.playerData.houseMangerID = data.houseManagerID;                  //保存房主id
                 for (let i = 0; i < playerData.length; i++){
                     this.addPlayerNode(playerData[i]);
                }
            }
             this.node.emit('init');
         });
        global.socket.onPlayerJoinRoom((data)=>{
            console.log('on player join room  =' + JSON.stringify(data));
            this.addPlayerNode(data);
         });
        global.socket.onPlayerReady((data)=>{
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                this.playerNodeList[i].emit('player_ready', data);
            }
        });
        global.socket.onGameStart(()=>{
           for (let i = 0 ; i < this.playerNodeList.length ; i ++){
               this.playerNodeList[i].emit('game-start');
           }
         });
         global.socket.onPushCard(()=>{
             console.log('gamescene:push card ');
           for (let i = 0 ; i < this.playerNodeList.length ; i ++){
               this.playerNodeList[i].emit('push-card');
           }
         });
         global.socket.onCanRobMaster((data)=>{//可以抢地主时，，，
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                 this.playerNodeList[i].emit('can_rob_master',data);
            }
         });
         global.socket.onPlayerRobState((data)=>{         //正在抢地主  的状态
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                 this.playerNodeList[i].emit('rob_state',data);
            }
         });
         global.socket.onChangeMaster((data)=>{         //确定地主
             console.log('on change master = ' + data);             //保存地主id
             global.playerData.masterID = data;
             for (let i = 0; i < this.playerNodeList.length; i++){
                 let node = this.playerNodeList[i];
                 node.emit('change_master',data);
                 if (node.getComponent('playerNode').accountID === data){
                     this.node.emit('master-pos',node.position);
                }
            }
         });
         global.socket.onPlayerPushCard((data)=>{
             console.log('player push card =' + JSON.stringify(data));
             for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                 this.playerNodeList[i].emit('player_push_card',data);
            }
         });
         this.node.on('add_card_to_player',()=>{         //监听添加底牌到手牌
            if (global.playerData.accountID !== global.playerData.masterID){
                for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                    this.playerNodeList[i].emit('add_three_card',global.playerData.masterID);
                }
            }
         });
    },
    initPlayerPos(seatIndex){
        //let children = this.playerPosNode.children;
        switch (seatIndex){
            case 0:
                this.playerPosList[0] = 0;
                this.playerPosList[1] = 1;
                this.playerPosList[2] = 2;

                break;

            case 1:

                this.playerPosList[1] = 0;
                this.playerPosList[2] = 1;
                this.playerPosList[0] = 2;

                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                break;
            default:
                break;
        }
    },

    addPlayerNode(data){
        let playerNode = cc.instantiate(this.playerNodePrefab);
        playerNode.parent = this.node;
        playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
        playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
        this.playerNodeList.push(playerNode);
    }
    /*
    客户端提示Uncaught TypeError: Cannot read property 'initWithData' of null, location:
assets/scripts/gameScene/gameScene.js:0:0
*/


});