//import EventListener from './../utility/event-listener'
const SocketController  = function () {
    let that = {};
    let _socket = io(defines.serverUrl);
    let _callBackMap = {};
    let _callBackIndex = 0;
   // let _event = EventListener({});
    _socket.on('notify',(data)=>{
        console.log('notify = ' + JSON.stringify(data));
        let callBackIndex = data.callBackIndex;
        if (_callBackMap.hasOwnProperty(callBackIndex)){
            let cb = _callBackMap[callBackIndex];
            if (data.err){
                cb(data.err);
            }else {
                cb(null,data.data);
            }

        }
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

    that.requestLogin =function (data,cb) {
        request('s-c:request login',data,cb);
    };

    that.requestCreateRoom =function (data,cb) {
        request('s-c:create room',data,cb);
    };

    that.requestJoinRoom =function (data,cb) {
        request('s-c:join room',data,cb);
    };
    return that;
};

export default SocketController;