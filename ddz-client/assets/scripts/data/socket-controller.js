import EventListener from './../utility/event-listener';
const SocketController  = function () {
    let that = {};
    let _socket = io(defines.serverUrl);
    let _callBackMap = {};
    let _callBackIndex = 0;
    let _event = EventListener({});
    _socket.on('notify',(data)=>{
        console.log('notify = ' + JSON.stringify(data));
        let callBackIndex = data.callBackIndex;
        if (_callBackMap.hasOwnProperty(callBackIndex)){
            let cb = _callBackMap[callBackIndex];
            if (data.data.err){
                cb(data.err);
            }else {
                cb(null,data.data);
            }
        }

        let type = data.type;
        _event.fire(type,data.data);
    });

    that.init = function () {

    };
    // that.requestwxLogin =function (data,cb) {
    //     socket.emit('wx-login',data);
    // };

    const notify = function (type,data,callBackIndex) {
        _socket.emit('notify',{type:type,data:data,callBackIndex:callBackIndex});
    };
    //实现一个request请求 保存了_callBackIndex和cb，再通过notify来发送
    const request = function (type,data,cb) {
        _callBackIndex ++;
        _callBackMap[_callBackIndex] = cb;
        notify(data,_callBackIndex);
    };

    that.requestLogin = function (data,cb) {
        request('login',data,cb);
    };

    that.requestCreateRoom = function (data,cb) {
        request('create_room',data,cb);
    };

    that.requestJoinRoom = function (data,cb) {
        request('join_room',data,cb);
    };

    that.requestEnterRoomScene = function (cb) {
        request('enter_room_scene',{},cb);
    };
    that.requestStartGame = function(cb){
        request('start_game',{},cb);
    };
    //玩家出牌
    that.requestPlayerPushCard = function(value,cb){
        request('player_push_card',value,cb);
    };

    that.notifyReady = function(){
        notify('ready',{},null);
    };
    //玩家抢与不抢通知服务端
    that.notifyRobState =function(value){
        notify('rob_state',value,null);
    };


    that.onPlayerJoinRoom = function () {
        _event.on('player_join_room',cb);
    };
    that.onPlayerReady = function (cb) {
        _event.on('player_ready',cb);
    };
    that.onGameStart = function (cb) {
        _event.on('game_start',cb);
    };
    that.onChangeHouseManager = function (cb) {
        _event.on('change_house_manager',cb);
    };
    that.onPushCard = function (cb){
        _event.on('push_card',cb);
    };
    that.onCanRobMaster = function () {
        _event.on('can_rob_master',cb);
    };
    that.onPlayerRobState =function () {
        _event.on('player_rob_state',cb);
    };
    that.onChangeMaster =function () {
        _event.on('change_master',cb);
    };
    that.onShowBottomCard = function (cb) {
        _event.on('show_bottom_card', cb);
    };
    that.onCanPushCard = function (cb) {
        _event.on('can_push_card', cb);
    };
    that.onPlayerPushCard = function (cb) {
        _event.on('player_push_card', cb);
    };
    return that;
};

export default SocketController;