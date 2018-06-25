const defines = require('./../defines');
const Carder = require('./carder');
const RoomState = {
    Invalide: -1,
    WaitingReady: 1,
    StartGame: 2,
    PushCard: 3,
    RobMaster: 4,
    ShowBottomCard: 5,
    Playing: 6
};
const getRandomStr = function (count) {
    let str = '';
    for (let i = 0; i < count; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};
//一个私有的方法，用于排座位号
const getSeatIndex = function (playerList) {
    let z = 0;

    if (playerList.length === 0) {
        return z;
    }
    for (let i = 0; i < playerList.length; i++) {
        if (z !== playerList[i].seatIndex) {
            return z;
        }
        z++;
    }
    console.log('z = ' + z);
    return z;
};

module.exports = function (spec, player) {
    let that = {};
    that.roomID = getRandomStr(6);
    let config = defines.createRoomConfig[spec.rate];
    let _bottom = config.bottom;
    let _rate = config.rate;
    let _houseManager = player;
    let _playerList = [];
    let _carder = Carder();
    let _lostPlayer = undefined;
    let _robMasterPlayerList = [];
    let _pushPlayerList = [];
    let _master = undefined;
    let _masterIndex = undefined;
    let _threeCardsList = _carder.getThreeCards();
    //当前玩家出的牌
    let _currentPlayerPushCardList = undefined;

/*    for(let i = 0; i < cards.length ; i++){
        for(let j = 0; j < cards.length ; j++){
            let card =cards[i][j];
            console.log(i + 'value = ' + card.value, 'shape' + card.shape,'king' + card.king);
        }
    }*/

//状态机操作
    let _state = RoomState.Invalide;
    const setState = function(state) {
        if (state === _state) {
            return;
        }
        //根据房间内当前状态做相应的操作
        switch (state){
            case RoomState.WaitingReady:
                break;
            case RoomState.StartGame:

                for (let i = 0 ; i < _playerList.length ; i ++) {
                    _playerList[i].sendGameStart();
                }
                setState(RoomState.PushCard);
                break;
            case RoomState.PushCard:
                console.log('push card');
                _threeCardsList = _carder.getThreeCards();
                for(let i = 0; i< _playerList.length ; i++) {
                    _playerList[i].sendPushCard(_threeCardsList[i]);
                }

                setState(RoomState.RobMaster);
                break;
            case RoomState.RobMaster:
                _robMasterPlayerList = [];
                if(_lostPlayer === undefined) {
                    for (let i =  _playerList.length - 1;i >= 0 ; i --) {
                        _robMasterPlayerList.push(_playerList[i]);
                    }
                }

                turnPlayerRobMaster();
                break;
            case RoomState.ShowBottomCard:
                for (let i = 0 ; i <_playerList.length ; i ++) {
                    //_threeCardsList[3]就是第四个元素也就是最后的三张底牌
                    _playerList[i].sendShowBottomCard(_threeCardsList[3]);
                }
                //延时2秒，让玩家看清底牌
                setTimeout(()=>{
                    setState(RoomState.Playing);
                },2000);
                break;
            case RoomState.Playing:
                //服务端轮流下发出牌逻辑
                for (let i = 0;i < _playerList.length ; i ++) {
                    if (_playerList[i].accountID === _master.accountID){
                        _masterIndex = i;
                    }
                }

                //服务端轮番下发出牌逻辑
                turnPushCardPlayer();
                break;
            default:
                break;
        }
            _state = state;
    };
    setState(RoomState.WaitingReady);
    that.joinPlayer = function (player) {
        player.seatIndex = getSeatIndex(_playerList);

        for (let i = 0;i < _playerList.length ; i ++) {
            _playerList[i].sendPlayerJoinRoom({
                nickName: player.nickName,
                accountID: player.accountID,
                avatarUrl: player.avatarUrl,
                gold: player.gold,
                seatIndex: player.seatIndex
            })
        }

        _playerList.push(player);

    };
    that.playerEnterRoomScene =function (player,cb) {
        let playerData = [];
        for (let i = 0 ; i < _playerList.length ; i ++) {
            playerData.push({
                nickName:_playerList[i].nickName,
                accountID:_playerList[i].accountID,
                avatarUrl: _playerList[i].avatarUrl,
                gold:_playerList[i].gold,
                seatIndex:_playerList[i].seatIndex
            });
        }
        //let index = getSeatIndex(_playerList);
        if (cb) {
            cb({
                seatIndex : player.seatIndex,
                playerData:playerData,
                roomID:that.roomID,
                houseManagerID:_houseManager.accountID
            })
        }
    };

    const referTurnPushPlayer =function () {
        let index = _masterIndex;
        for (let i = 2;i >= 0; i --) {
            let z = index;
            if (z >= 3) {
                z= z - 3;
            }

            _pushPlayerList[i] = _playerList[z];
            index ++;
        }
    };
        //当玩家列表为0时刷新出牌玩家索引，即可实现轮番出牌的目的
    const turnPushCardPlayer = function () {
        if (_pushPlayerList.length === 0) {
            referTurnPushPlayer();
        }
        let player = _pushPlayerList.pop();
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerCanPushCard(player.accountID);
        }
    };
    that.playerPushCard = function(player,cards,cb) {
        if (cards.length === 0) {
            turnPushCardPlayer();
        }else {
            ///判断牌型是否合适
            if (_carder.isCanPushCards(cards)) {
                if (_currentPlayerPushCardList === undefined) {
                    if (cb) {
                        cb(null, 'push card success');
                    }

                    sendPlayerPushCard(player,cards);
                    turnPushCardPlayer();
                } else {
                    //
                }
            }else{
                if (cb) {
                    cb('不可用的牌型');
                }
            }
        }
    };




















    //服务端下发玩家出的牌
    const sendPlayerPushCard = function(player,cards) {

        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerPushCard()



        }
    };

    that.playerRobStateMaster = function (player,value) {
        if (value === 'ok') {
            console.log('rob master ok');
            _master = player;


        }else if (value === 'no-ok') {
            console.log('rob master no ok');

        }

        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerRobStateMaster(player.accountID,value);
        }


        turnPlayerRobMaster();
    };
    //重新选取房主
    const changeHouseManager = function () {
        if (_playerList.length === 0) {
            return;
        }
        _houseManager = _playerList[0];
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendChangeHouseManager(_houseManager.accountID);
        }
    };
    //轮流抢地主
    const turnPlayerRobMaster = function () {
        if (_robMasterPlayerList.length === 0) {
            console.log('抢地主结束');
            changeMaster();
            return;
        }

        let player = _robMasterPlayerList.pop();
        //前面两个玩家没抢地主则确定第三个人为地主
        if (_robMasterPlayerList.length === 0 && _master === undefined) {
            _master = player;
            changeMaster();
            return;
        }
        for (let i = 0 ; i < _playerList.length ; i ++) {
            _playerList[i].sendPlayerCanRobMaster(player.accountID);
        }
    };
    //确定谁是地主
    const changeMaster = function () {
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendChangeMaster(_master,_threeCardsList[3]);
        }
        setState(RoomState.ShowBottomCard);
    };


/*    const gameStart = function (){
        for (let i = 0 ; i < _playerList.length ; i ++){
            _playerList[i].sendGameStart();
        }

    };*/

    //玩家离线功能
    that.playerOffLine = function (player) {
        for (let i = 0; i < _playerList.length; i++) {
            if (_playerList[i].accountID === player.accountID) {
                _playerList.splice(i, 1);
                if (player.accountID === _houseManager.accountID) {
                    changeHouseManager();
                }
            }
        }
    };
    that.playerReady = function (player) {
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerReady(player.accountID);
        }
    };
    that.houseManagerStartGame = function(player,cb) {
        if (_playerList.length !== defines.roomFullPlayerCount) {
            if (cb) {
                cb('玩家不足，不能开始游戏!');
            }
            return;
        }
        for (let i = 0 ; i < _playerList.length ; i ++) {
            if (_playerList[i].accountID !== _houseManager.accountID) {
                if (_playerList[i].isReady === false) {
                    if (cb) {
                        cb('有玩家还没准备，不能开始游戏!');
                    }
                    return;
                }
            }
        }
        if (cb) {
            cb(null,'success');
        }
        //gameStart();
        setState(RoomState.StartGame);
    };
//取回底分和倍数
    that.getPlayerCount = function () {
        return _playerList.length;
    };
    Object.defineProperty(that, 'bottom', {
        get() {
            return _bottom;
        }
        // set(val) {
        //     _bottom = val;
        // }
    });
    Object.defineProperty(that, 'rate', {
        get() {
            return _rate;
        }
    });
    return that;
};