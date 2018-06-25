module.exports = function (spec, socket, cbIndex, gameContorller) {
    let that = {};
    that.gold = spec.gold_count;
    let _socket = socket;
    console.log('create new player = ' + JSON.stringify(spec));
    //以下代码把昵称id头像挂在that下面可以用很方便外部读取，但是外部也有权限修改，不是很安全
    that.nickName = spec.nick_name;
    that.accountID = spec.account_id;
    that.avatarUrl = spec.avatar_url;
    that.gold = spec.gold_count;
    that.seatIndex = 0;
    that.isReady = false;
    that.cards = [];

    let _room = undefined;
    const notify = function (type, data, callBackIndex) {
        console.log('notify =' + JSON.stringify(data));
        _socket.emit('notify', {
            type: type,
            data: data,
            callBackIndex: callBackIndex
        });
    };

    notify('login',{
        //goldCount: _goldCount
        goldCount: that.gold
    }, cbIndex);

    _socket.on('disconnect', ()=>{
        console.log('玩家掉线');
        //这里的意思是如果房间存在才能掉线
        if (_room){
            _room.playerOffLine(that);
        }
    });
    _socket.on('notify', (notifyData)=>{
        let type = notifyData.type;
        //let data = notifyData.data;为了避免data引起混淆直接用notifyData.data
        console.log('player:notify data = ' + JSON.stringify(notifyData.data));
        let callBackIndex = notifyData.callBackIndex;
        switch (type){
            case 'create_room':
                //notify('create_room',{data: 'create_room'},callBackIndex);
                gameContorller.createRoom(notifyData.data, that, (err, data)=>{
                    if (err){
                        console.log('err =' + err);
                        notify('create_room',{err: err},callBackIndex);

                    }else {
                        console.log('data = ' + JSON.stringify(data));
                        notify('create_room',{data: data},callBackIndex);

                    }
                });

                break;

            case 'join_room':
                console.log('join room data = ' + JSON.stringify(notifyData.data));
                gameContorller.joinRoom(notifyData.data, that,(err, data)=>{
                    if (err){
                        notify('join_room', {err: err}, callBackIndex);
                    }else{
                        _room = data.room;
                        notify('join_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'enter_room_scene':
                if (_room){
                    _room.playerEnterRoomScene(that,(data)=>{
                        that.seatIndex = data.seatIndex;
                        notify('enter_room_scene', data, callBackIndex);
                    });
                }
                break;
            case 'ready':
                that.isReady = true;
                if (_room){
                    _room.playerReady(that);
                }
                break;
            case 'start_game':
                if (_room){
                    _room.houseManagerStartGame(that, (err, data)=>{
                        if (err){
                            notify('start_game', {err: err}, callBackIndex);
                        }else {
                            notify('start_game', {data: data}, callBackIndex);

                        }
                    });
                }
                break;

            case 'rob_state':
                if (_room){
                    _room.playerRobStateMaster(that, notifyData.data);
                }
                break;

        case 'myself_push_card':
            if (_room){
                _room.playerPushCard(that, notifyData.data, (err, data)=>{
                    if (err){
                        notify('myself_push_card', {err: err}, callBackIndex);
                    }else {
                        notify('myself_push_card', {data: data}, callBackIndex);

                    }
                });
            }
            break;
        case 'request-tips':
            if (_room){
                _room.playerRequestTips(that, (err, data)=>{
                   if (err){
                       notify('request-tips', {err: err}, callBackIndex);
                   } else {
                       notify('request-tips', {data: data}, callBackIndex);
                   }
                });
            }
            break;
            default:
                break;
        }
    });
//服务端主动给客户端发消息
    that.sendPlayerJoinRoom = function (data) {
        notify('player_join_room', data, null);
    };

    that.sendPlayerReady = function (data) {
        notify('player_ready', data, null);
    };
    that.sendGameStart = function () {
        notify('game_start', {}, null);
    };

   that.sendChangeHouseManager = function (data) {
       notify('change_house_manager', data, null);
   };


   that.sendPushCard = function (cards) {
       that.cards = cards;
       notify('push_card', cards, null);
   };

   that.sendPlayerCanRobMaster = function (data) {
       notify('can_rob_master', data, null);
   };

    that.sendPlayerRobStateMaster = function (accountID, value) {
        notify('player_rob_state', {accountID: accountID, value: value}, null);
    };

    that.sendChangeMaster = function (player, cards) {
        notify('change_master', player.accountID);
    };
    that.sendShowBottomCard = function (data) {
        notify('show_bottom_card' , data);
    };
    that.sendPlayerCanPushCard = function (data, notPushCardNumber) {
        notify('can_push_card', {uid: data, count: notPushCardNumber});
    };
    that.sendPlayerPushCard = function (data) {
        let accountID = data.accountID;
        if (accountID === that.accountID){
            let cards = data.cards;
            for (let i = 0 ; i < cards.length ; i ++){
                //需要删掉的卡牌
                let card = cards[i];
                for (let j = 0 ; j < that.cards.length ; j ++){
                    if (card.id === that.cards[j].id){
                        that.cards.splice(j, 1);
                    }
                }
            }
        }
        notify('player_push_card', data);
    };

    // that.send
    //
    // Object.defineProperty(that, 'nickName', {
    //     get(){
    //         return _nickName
    //     }
    // });

    return that;
};