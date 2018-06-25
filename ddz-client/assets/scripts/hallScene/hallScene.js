import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {
        nickNameLabel: cc.Label,
        idLabel: cc.Label,
        goldCountLabel: cc.Label,
        headImage: cc.Sprite,
        createRoomPrefab: cc.Prefab,
        joinRoomPrefab: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.nickNameLabel.string = global.playerData.nickName;
        this.idLabel.string = 'ID:' + global.playerData.accountID;
        this.goldCountLabel.string = global.playerData.goldCount;


        cc.loader.load({url:global.playerData.avatarUrl,type:'jpg'},(err,tex)=> {
            //以下是对头像图片的缩放处理以适应背景框的大小
            let oldWidth = this.headImage.node.width;
            console.log('old withd' + oldWidth);
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            this.headImage.node.scale = oldWidth / newWidth;
        });
    },


    start () {

    },

    onButtonClick(event,customData){
        switch(customData){
            case 'create_room':
                console.log('create_room sucess');
                //global.socket.request();
                let createRoom = cc.instantiate(this.createRoomPrefab);
                createRoom.parent = this.node;
                break;
            case 'join_room':
                console.log('join room sucess');
                let joinRoom = cc.instantiate(this.joinRoomPrefab);
                joinRoom.parent = this.node;
                break;
            default:
                break;
        }
    }
});
