import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        headImage: cc.Sprite,
        idLabel: cc.Label,
        nickNameLabel: cc.Label,
        goldLabel: cc.Label,
        readyIcon: cc.Node,
        offlineIcon: cc.Node,
        cardsNode: cc.Node,
        pushCardNode:cc.Node,
        cardPrefab:cc.Prefab,
        tipsLabel:cc.Label,
        infoNode:cc.Node,
        timeLabel:cc.Label,
        robIconSp: cc.Sprite,
        masterIcon: cc.Sprite,
        robIcon: cc.SpriteFrame,
        noRobIcon:cc.SpriteFrame
    },
    onLoad() {
        this.cardList = [];
        this.readyIcon.active = false;
        this.offlineIcon.active = false;
        this.node.on('game-start', () => {
            //消除游戏开始后的准备标志
            this.readyIcon.active = false;
        });
        this.node.on('push-card',()=>{
            //自己是不需要额外显示发出的牌的，另外两个玩家才需要显示背面牌组
            if (this.accountID !== global.playerData.accountID){
                this.pushCard();
            }
        });
        this.node.on('can_rob_master',(event)=>{
            let detail = event.detail;
            if (detail === this.accountID && detail !== global.playerData.accountID) {
                this.infoNode.active = true;
                this.tipsLabel.string = '正在抢地主';
                this.timeLabel.string = '5';
            }
        });
        this.node.on('rob_state',(event)=> {
            let detail = event.detail;
            console.log('player node rob state detail= ' + JSON.stringify(detail));
            if (detail.accountID === this.accountID) {
                this.infoNode.active = false;
                switch (detail.value){
                    case 'ok':
                        this.robIconSp.node.active = true;
                        this.robIconSp.spriteFrame = this.robIcon;
                        break;
                    case 'no-ok':
                        this.robIconSp.node.active = true;
                        this.robIconSp.SpriteFrame = this.noRobIcon;
                        break;
                    default:
                        break;
                }
            }
        });
        this.node.on('change_master', (event) => {
            let detail = event.detail;
            this.robIconSp.node.active = false;
            if (detail === this.accountID) {
                this.masterIcon.active = true;
                //给 地主标识做一个简单特效
                this.masterIcon.scale = 0.6;
                this.masterIcon.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()));
            }
        });

        //
        this.node.on('player_push_card',(event) =>{
            let detail = event.detail;
/*            {
                accountID:playerData.accountID,
                    cards:cards
            }*/
            if (detail.accountID === this.accountID && global.playerData.accountID){
                this.playerpushcard();
            }
        });
        this.node.on('add_three_card',(event)=>{
            let detail = event.detail;
            if (detail === this.accountID) {
                for (let i = 0 ; i < 3 ; i ++){
                    this.pushOneCard ();
                }
            }
        });
/*        this.pushCard();
        for (let i = 0 ; i < 3 ; i ++) {
            this.pushOneCard();
        }*/
    },
    initWithData(data,index) {
        // {"nickName":"小明14","accountID":"2162095","avatarUrl":"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg","gold":100}]}
        this.accountID = data.accountID;
        this.idLabel.string = 'ID:' + data.accountID;
        this.nickNameLabel.string = data.nickName;
        this.goldCountLabel.string = data.gold;
        this.index = index;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            cc.log('should load a texture from RESTful API by specify the type:' + (tex instanceof cc.texture2D));
            //以下是对头像图片的缩放处理以适应背景框的大小
            let oldWidth = this.headImage.node.width;
            console.log('old withd' + oldWidth);
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            console.log('old withd' + newWidth);
            this.headImage.node.scale = oldWidth / newWidth;
        });
        this.node.on('player_ready', (event) => {
            let detail = event.detail;
            console.log('player ready detail =' + detail);
            if (detail === this.accountID) {
                this.readyIcon.active = true;
            }
        });
        this.node.on('can_rob_master', (event) => {
            let detail = event.detail;
            if (detail === this.accountID) {
                this.readyIcon.active = true;
            }
        });
        //当位置为1即右边玩家位置时，index乘以-1将位置取反，使背面牌出现在头像的左边
        if (index === 1){
            this.cardsNode.x *= -1;
            this.pushCardNode.x *= -1;
        }
    },
    //发牌
    pushCard (){
        this.cardsNode.active = true;
        for (let i = 0 ; i < 17 ; i ++){
            let card = cc.instantiate(thjis.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 0.4;
            let height = card.height;
            card.y = (17-1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
            this.cardList.pushCard(card);
        }
    },
    //给其他玩家发牌的操作
    pushOneCard (){
        let card = cc.instantiate(this.cardPrefab);
        card.parent = this.cardsNode;
        card.scale = 0.4;
        let height = card.height;
        card.y = (17-1) * 0.5 * height * 0.4 * 0.3 - this.cardList.length * height * 0.4 * 0.3;
        this.cardList.pushCard(card);
    },
    //玩家出牌
    playerPushCard (cardsData){
        //清除之前的子节点
        for (let i = 0 ; i < this.pushCardNode.children.length ; i ++){
            this.pushCardNode.children.destroy();
        }

        for (let i = 0 ; i < cardsData.length ; i ++){
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushCardNode;
            card.scale = 0.4;
            let height = card.height;
            card.y = (cardsData.length - 1 ) * 0.5 * height * 0.4 * 0.3 - i * height * 0.4 * 0.3;
            card.getComponent('card').showCard(cardsData[i])
        }
        //删掉一张其他玩家背面显示的牌
        for (let i = 0 ; i < cardsData.length ; i ++){
            let card = this.cardList.pop();
            card.destroy();
        }
        this.referCardPos();
    },

    //重新调整牌的位置
    referCardPos(){
        for (let i = 0 ; i < this.cardList.length ; i ++){
            let card = this.cardList[i];
            let height = card.height;
            card.y = (this.cardList.length - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;

        }
});




















