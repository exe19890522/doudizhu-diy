import global from './../global'

cc.Class({
    extends: cc.Component,
    properties: {
        gameingUI: cc.Node,
        cardPrefab: cc.Prefab,
        playerCardPos: cc.Node,
        robUI: cc.Node,
        playUI:cc.Node,
        tipsLabel: cc.Label,
        pushCardNode: cc.Node,
        noPushCardButton: cc.Node
    },
    onLoad () {
        this.bottomCards = [];
        let bottomCardData = [];
        this.cardList = [];
        this.chooseCardDataList = [];
        this.tipsCardsList = [];
        this.tipsCardsIndex = 0;
        global.socket.onPushCard((data) => {
            console.log('push card' + JSON.stringify(data));
            this.pushCard(data);
        });
        //this.pushCard();
        //可以抢地主时提示抢地主
        global.socket.onCanRobMaster((data) => {
            console.log('can_rob_master data = ' + data);
            if (data === global.playerData.accountID) {
                this.robUI.active = true;
            }
        });
        //显示三张底牌
        global.socket.onShowBottomCard((data)=> {
            console.log('show bottom card = ' + JSON.stringify(data));
            bottomCardData = data;//对比代码添加的
            for (let i = 0 ; i < data.length ; i ++) {
                let card = this.bottomCards[i];
                card.getComponent('card').showCard(data[i]);
            }

            this.node.runAction(cc.sequence(cc.delayTime(2),cc.callFunc(() => {
               let index = 0;
                const runActionCb = () => {
                    index ++;
                    if (index === 3) {
                        this.node.emit('add_card_to_player');
                    }
                };
                //取到三张底牌中的一张
                for (let i = 0 ; i < this.bottomCards.length ; i ++){
                    let card = this.bottomCards[i];
                    let width = card.width;
                    this.runCardAction(card,cc.p((this.bottomCards.length - 1) * 0.5 * width * 0.7 + width * 0.7 * i,280),runActionCb);
                }
                //底牌置空
                //this.bottomCards = [];
            })));
        });
        global.socket.onCanPushCard((data) => {
            console.log('on can push card = ' + JSON.stringify(data));
            if (data === global.playerData.accountID){
                this.playUI.active = true;
                for (let i = 0 ; i < this.pushCardNode.children.length; i ++) {
                    this.pushCardNode.children[i].destroy();
                }
                //this.chooseCardDataList = [];
            }
        });

        global.socket.onPlayerPushCard((data)=> {
            console.log('player push card =' + JSON.stringify(data));
            if (data.accountID ===global.playerData.accountID) {
                let cardsData = data.cards;
                for (let i = 0 ; i < cardsData.length ; i ++) {
                    let card = cc.instantiate(this.cardPrefab);
                    card.parent =this.pushCardNode;
                    card.scale = 0.6;
                    let width = card.width;
                    card.x = (cardsData.length - 1) * -0.5 * width * 0.7 +width * 0.7 * i;
                    card.getComponent('card').showCard(cardsData[i]);
                }
            }
                // for (let i = 0; i < this.playerNodeList.length ; i ++){
                //     this.playerNodeList[i].emit('player_push_card',data);
                // }

        });

        //做的牌显示特效：
        this.node.on('master-pos',(event) => {
            //let detail = event.detail;
            this.masterPos = event.detail;
        });
        this.node.on('add_card_to_player', () => {
            if (global.playerData.accountID === global.playerData.masterID) {
                for (let i = 0; i < bottomCardData.length ; i ++) {
                    let card = cc.instantiate(this.cardPrefab);
                    card.parent = this.gameingUI;
                    card.scale = 0.8;
                    card.x = card.width * 0.4 *(17 - 1)* -0.5 + card.width * 0.4 * this.cardList.length;
                    card.y = -250;
                    card.getComponent('card').showCard(bottomCardData[i],global.playerData.accountID);
                    this.cardList.push(card);
                }
                this.sortCards();
            }
        });
        //接受客户端发来的选牌信息、取消选牌的信息
        cc.systemEvent.on('choose_card',(event) => {
            let detail= event.detail;
            this.chooseCardDataList.push(detail);
        });
        cc.systemEvent.on('unchoose_card',(event) => {
            let detail= event.detail;
            for (let i = 0 ; i < this.chooseCardDataList.length; i ++){
                if (this.chooseCardDataList[i].id === detail.id){
                    this.chooseCardDataList.splice(i,1);
                }
            }
        });
        //从手牌中删除一张打出的牌
/*        cc.systemEvent.on('rm-card-from-list',(event)=>{
            let detail = event.detail;
            for (let i = 0 ; i < this.cardList.length; i ++){
                let card = this.cardList[i];
                if (card.getComponent('card').id === detail){
                    this.cardList.splice(i,1);
                }
            }
        });*/
    },








    //底牌的动画 func :底牌一边向地主头像移动，一边缩小并删除 才
    runCardAction(card, pos, cb) {
        let moveAction = cc.moveTo(0.5,pos);
        let scaleAction = cc.scaleTo(0.5,0.6);
        card.runAction(scaleAction);
        card.runAction(cc.sequence(moveAction,cc.callFunc(() => {
            //card.destroy();
            if (cb) {
                cb();
            }
        })));
    },
    sortCards() {    //手牌排序方法
        this.cardList.sort(function (x, y) {
            let a = x.getComponent('card').cardData;
            let b = y.getComponent('card').cardData;
            //普通牌之间比较大小
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value - a.value;
            }
            //王牌跟不是王牌比较
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1;
            }
            //不是王牌跟王牌比较
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1;
            }
            //王牌之间比较
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king;
            }
        });

        let x = this.cardList[0].x;

        for (let i = 0 ; i < this.cardList.length ; i ++) {
            let card = this. cardList[i];
            //修饰卡牌显示
            card.zIndex = i;
            card.x = x + card.width * 0.4 * i;
        }
        this.referCardsPos();
    },
       pushCard(data) {

        //将客户端显示的牌组重新排序:从大到小排序
        if (data) {
            data.sort(function (a, b) {
                //普通牌之间比较大小
                if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                    return b.value - a.value;
                }
                //王牌跟不是王牌比较
                if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                    return -1;
                }
                //不是王牌跟王牌比较
                if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return 1;
                }
                //王牌之间比较
                if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return b.king - a.king;
                }
            });
            //将服务端发来的牌组显示出来（没有上面的代码就会是乱序的）
            for (let i = 0 ; i <data.length ; i ++) {
                let card =cc.instantiate(this.cardPrefab);
                card.parent = this.gameingUI;
                //console.log('gUI:card=' + JSON.stringify(card));
                card.scale = 0.8;
                card.x = card.width * 0.4 *(17 - 1) * -0.5 + card.width * 0.4 * i;
                card.y = -250;
                card.getComponent('card').showCard(data[i],global.playerData.accountID);
                this.cardList.push(card);
            }
        }
        //底牌置空
        this.bottomCards = [];
        //在牌局桌面上显示三张底牌
        for (let i = 0; i < 3; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.gameingUI;
            card.scale = 0.8;
            card.y = 60;
            card.x = (card.width * 0.8 + 20) *(3 - 1)* -0.5 + (card.width * 0.8 +20) * i;
            this.bottomCards.push(card);
        }

    },
    onButtonClick(event, customData) {
        switch (customData) {
            case 'rob':
                console.log('抢地主');
                global.socket.notifyRobState('ok');
                this.robUI.active= false;
                break;
            case 'no-rob':
                console.log('不抢');
                global.socket.notifyRobState('no-ok');
                this.robUI.active = false;
                break;
            case 'no-push':
                console.log('不出');
                this.playUI.active = false;
                //不出牌就传一个空的列表给服务端
                global.socket.requestPlayerPushCard([], () => {
                    console.log('不出牌回调');
                });
                break;

            case 'tip':
                console.log('提示');
                //global.socket.notifyRobState('tip');

                break;

            case 'ok-push':
                //出牌列表为空时不能出牌
                if (this.chooseCardDataList.length === 0) {
                    return;
                }
                global.socket.requestPlayerPushCard(this.chooseCardDataList,(err,data) => {
                    if (err) {
                        console.log('push card err = ' + err);
                        if (this.tipsLabel.string === '') {
                            this.tipsLabel.string = err;
                            setTimeout(() => {
                                this.tipsLabel.string = '';
                            },2000);
                        }
                        //出牌之后要继续出牌，需要归位
                        for (let i = 0 ; i < this.cardList.length ; i ++) {
                            this.cardList[i].emit('init-y',this.chooseCardDataList);
                        }
                        this.chooseCardDataList = [];

                    }else {
                        console.log('choose card data list =' + JSON.stringify(this.chooseCardDataList));
                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].emit('pushed-card', this.chooseCardDataList);
                        }
                        //将打出的牌从手牌中删掉
                        for (let i = 0; i < this.chooseCardDataList.length; i++) {
                            let cardData = this.chooseCardDataList[i];
                            for (let j = 0; j < this.cardList.length; j++) {
                                let card = this.cardList[j];
                                if (card.getComponent('card').id === cardData.id) {
                                    this.cardList.splice(j, 1);
                                }
                            }
                        }

                        console.log('push card data = ' + JSON.stringify(data));
                        this.playUI.active = false;
                        this.chooseCardDataList = [];
                        this.referCardsPos();
                    }
                });
                console.log('出牌');
                break;
            default:
                break;
        }
    },
    referCardsPos(){    //刷新手牌的位置
        for (let i = 0 ; i < this.cardList.length; i ++) {
            let card = this.cardList[i];
            let width = card.width;
            card.x = (this.cardList.length - 1) * width * 0.4  -0.5 + width * 0.4 * i;
        }
    }
});