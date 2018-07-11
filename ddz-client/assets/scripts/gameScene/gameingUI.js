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
            console.log('玩家出牌为' + JSON.stringify(data));
            //console.log('push card==' + JSON.stringify(data));
            this.pushCard(data);
        });
        //this.pushCard();
        //可以抢地主时提示抢地主
        global.socket.onCanRobMaster((data) => {
            console.log('11可以抢地主了 ' +data);
            //console.log('can_rob_master data = ' + data);
            if (data === global.playerData.accountID) {
                this.robUI.active = true;
            }
        });
        //显示三张底牌
        global.socket.onShowBottomCard((data)=> {
            console.log('显示底牌为' + JSON.stringify(data));
            //console.log('show bottom card = ' + JSON.stringify(data));
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
                    //console.log('添加底牌到地主手牌√');
                };
                //取到三张底牌中的一张。此处的cc.p得到的是底牌移动到界面上方的坐标
                for (let i = 0 ; i < this.bottomCards.length ; i ++){
                    let card = this.bottomCards[i];
                    let width = card.width;
                    this.runCardAction(card,cc.p((this.bottomCards.length - 1) * 0.5 * width * 0.7 + width * 0.7 * i,280),runActionCb);
                    //console.log('ccp位置：：'+ cc.p((this.bottomCards.length - 1) * 0.5 * width * 0.7 + width * 0.7 * i,280));
                }
                //  console.log('取到三张底牌中的一张');
                //底牌置空
                //this.bottomCards = [];
            })));
        });
        global.socket.onCanPushCard((data) => {
            console.log('可以出牌了' + JSON.stringify(data)+'aID='+global.playerData.accountID);
            //console.log('on can push card = ' + JSON.stringify(data));

            let uid = data.uid;
            let count = data.count;
            if (uid === global.playerData.accountID) {
                console.log('count  = ' + count);
                this.noPushCardButton.active = true;
                if (count === 2){
                    this.noPushCardButton.active = false;
                }
                this.playUI.active = true;
                console.log('代码运行到这里了this.playUI.active = true');
                for (let i = 0 ; i < this.pushCardNode.children.length; i ++) {

                    this.pushCardNode.children[i].destroy();
                }
                this.tipsCardsList = [];
                this.tipsCardsIndex = 0;
                console.log('代码运行到这里了this.pushCardNode.children[i].destroy()');
                //this.chooseCardDataList = [];
            }else{
                console.log('gUI90:!!!!!!uid=' + data.uid + ' !==' + global.playerData.accountID);
            }
        });

        global.socket.onPlayerPushCard((data)=> {
            console.log('玩家出牌为' + JSON.stringify(data));
            //console.log('player push card =' + JSON.stringify(data));
            if (data.accountID === global.playerData.accountID) {
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

        //做底牌显示特效：
        this.node.on('master-pos', (event) => {
            let detail = event.detail;
            this.masterPos = detail;
            //console.log('detail=' + JSON.stringify(detail));
        });
        this.node.on('add_card_to_player', () => {
            console.log('开始重新排序地主手牌√');
            //console.log('aID=' +global.playerData.accountID + 'mID' + global.playerData.masterID);
            if (global.playerData.accountID === global.playerData.masterID) {
                for (let i = 0; i < bottomCardData.length ; i ++) {
                    let card = cc.instantiate(this.cardPrefab);
                    card.parent = this.gameingUI;
                    card.scale = 0.8;
                    //原版card.x = card.width * 0.4 *(17 - 1)* -0.5 + card.width * 0.4 * this.cardList.length;
                    card.x = card.width * 0.4 *(17 - 1)* -0.5 + card.width * 0.4 * i;
                    //card.x = (this.cardList.length - 1) * width * 0.4 * -0.3 + width * 0.4 * i;
                    card.y = -250;
                    card.getComponent('card').showCard(bottomCardData[i],global.playerData.accountID);
                    this.cardList.push(card);
                    //console.log('gUI134-card.x'+card.x +'accountID' + global.playerData.accountID);
                }
                this.sortCards();
                //console.log('+++++重新排序地主手牌结束√');
            }
        });
        //接受客户端发来的选牌信息、取消选牌的信息
        cc.systemEvent.on('choose_card',(event) => {
            let detail= event.detail;
            console.log('gUI143:chooseCardDataList=' + JSON.stringify(this.chooseCardDataList));
            this.chooseCardDataList.push(detail);
            console.log('gUI145选牌detail=' + JSON.stringify(detail));
            console.log('gUI146:chooseCardDataList=' + JSON.stringify(this.chooseCardDataList));
        });
        cc.systemEvent.on('unchoose_card',(event) => {
            let detail= event.detail;
            for (let i = 0 ; i < this.chooseCardDataList.length; i ++) {
                if (this.chooseCardDataList[i].id === detail.id) {  
                    console.log('取消选择牌' + detail.id);
                    this.chooseCardDataList.splice(i, 1);
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








    //底牌的动画 func :底牌一边向地主头像移动，一边缩小并删除,此处的pos是三张底牌移动到界面上方的坐标位置
    runCardAction(card, pos, cb) {
        //console.log('//////////pos==' + pos);
        let moveAction = cc.moveTo(0.5,pos);
        let scaleAction = cc.scaleTo(0.5,0.6);
        card.runAction(scaleAction);
        card.runAction(cc.sequence(moveAction,cc.callFunc(() => {
            //card.destroy();
            console.log('//////////底牌消除动画执行中');
            if (cb) {
                cb();
            }
        })));
        console.log('//////////此动画执行中√');
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
console.log('手牌排序中。。。。。。。。。√');
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

        //将客户端显示的牌组重新排序:从大到小排序;农民手牌显示方式
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
                //console.log('gUI249:card=////' + JSON.stringify(card));
                card.scale = 0.8;
                card.x = card.width * 0.4 *(17 - 1) * -0.5 + card.width * 0.4 * i;
                //card.x = (this.cardList.length - 1) * width * 0.4 * -0.3 + width * 0.4 * i;
                card.y = -250;
                card.getComponent('card').showCard(data[i],global.playerData.accountID);
                //console.log('gUI255:accountid=' + global.playerData.accountID);
                this.cardList.push(card);
                console.log('gUI257:card.x=' + JSON.stringify(card.x) + 'card.width' +card.width);
            }
            //console.log('11手牌重新排序结束。。。。。。。。。');
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
            //console.log('11-----显示背面的底牌结束');
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

                if (this.tipsCardsList.length === 0) {
                    global.socket.requestTipsCards((err, data) => {
                        if (err) {

                        } else {
                            console.log('data = ' + JSON.stringify(data));
                            this.tipsCardsList = data.data;
                            console.log('this.tipsCardsList =  ' + JSON.stringify(this.tipsCardsList));
                            this.showTipsCards(this.tipsCardsList);
                            // this.tipsCardsIndex ++;
                        }
                    });
                } else {
                    // let cards = this.tipsCardsList[this.tipsCardsIndex];
                    this.showTipsCards(this.tipsCardsList);
                }

                // this.tipsCardsIndex ++;
                // if (this.tipsCardsIndex >= this.tipsCardsList.length){
                //     this.tipsCardsIndex = 0;
                // }


                break;
            case 'ok-push':
                //出牌列表为空时不能出牌
                if (this.chooseCardDataList.length === 0) {
                    console.log('gUI326  this.chooseCardDataList为空');
                    return;
                }
                console.log('gUI328选中牌的内容：' + JSON.stringify(this.chooseCardDataList));
                global.socket.requestPlayerPushCard(this.chooseCardDataList, (err, data) => {
                    if (err) {
                        console.log('/*/*/*push card err = ' + err);
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
                        //console.log('choose card data list =' + JSON.stringify(this.chooseCardDataList));
                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].emit('pushed-card', this.chooseCardDataList);
                            console.log('gUI348:this.chooseCardDataList==' + this.chooseCardDataList);
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

                        console.log('gUI361:push card data = ' + JSON.stringify(data));
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
    referCardsPos() {    //刷新手牌的位置; 地主手牌显示位置
        for (let i = 0 ; i < this.cardList.length; i ++) {
            let card = this.cardList[i];
            let width = card.width;
            card.x = (this.cardList.length - 1) * width * 0.4 * -0.5 + width * 0.4 * i +69;
            //69是为了把地主的牌向右移动一段位置，修饰地主手牌显示

            console.log('gUI380:referCardsPos-card.x：' + card.x + '--width='+width+'this.cardList.length='+this.cardList.length);
        }
    },
    showTipsCards(cardsList) {
        if (cardsList.length === 0) {
            if (this.tipsLabel.string === '') {
                this.tipsLabel.string = '你没有大过上家的牌型';
                setTimeout(() => {
                    this.tipsLabel.string = '';
                }, 2000);
            }


            return;
        }

        let cards = cardsList[this.tipsCardsIndex];
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].emit('init-y');
        }
        for (let i = 0; i < this.cardList.length; i++) {
            // init-y
            this.cardList[i].emit('tips-card', cards);
        }
        this.tipsCardsIndex++;
        if (this.tipsCardsIndex >= cardsList.length) {
            this.tipsCardsIndex = 0;
        }


    },
});