import global from './../../global'
cc.Class({
    extends:cc.Component,
    properties:{
        LabelNode : cc.Node,
    },
    onLoad(){
        this.labelList = this.labelNode.children;
        this.roomIDStr = '';

    },
    onButtonClick(event,customData){
        console.log('click =' + customData);

        if (customData.length === 1){
            this.roomIDStr += customData;
            if  (this.roomIDStr.length === 6) {
                console.log('join room');
                global.socket.requestJoinRoom(this.roomIDStr,(err,data)=>{
                    if (err){
                        console.log('err = ' + err);
                    }else {
                        //{"data":{"bottom":10,"rate":3}}
                        console.log('join room = ' + JSON.stringify(data));
                        global.playerData.bottom = data.data.bottom;
                        global.playerData.rate = data.data.rate;
                        cc.director.loadScene('gameScene');
                    }
                })
            }

            if (this.roomIDStr.length > 6){
                this.roomIDStr = this.roomIDStr.substring(0 , this.roomIDStr.length - 1);
            }
        }

        switch (customData){
            case 'close':
                this.node.destroy();
                break;
            case 'houtui':
                this.roomIDStr = this.roomIDStr.substring(0 , this.roomIDStr.length - 1);
                break;
            case 'qingchu':
                this.roomIDStr = '';
                break;
            default:
                break;
        }
    },
    update(dt){
        for(let i = 0 ; i < this.labelList.length ; i ++){
            this.labelList[i].getComponent(cc.Label).string= '';
        }
        for(let i = 0 ; i < this.roomIDStr.length ; i ++){
            this.labelList[i].getComponent(cc.Label).string= this.roomIDStr[i];
        }
        this.roomIDLabel.string = this.roomIDStr;
    }
});
















