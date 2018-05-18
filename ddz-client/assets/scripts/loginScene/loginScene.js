import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // let socket = io("http://localhost:3000");
        // socket.on('welcome', (data)=>{
        //     console.log('welcome ' + data);
        // });
        global.socket.init();
        global.eventListener.on('test', (data)=>{
            console.log('test success' + data);
        });
        //下面一段代码只是再一次验证test，没什么意义
        global.eventListener.on('test', (data)=>{
            console.log('test 1 sucess' + data);
        });
        global.eventListener.fire('test', 'ok');
    },

    onButtonClick(event,customData){
        switch(customData){
            case 'wxLogin':
                console.log('微信登陆');
                global.socket.requestLogin({
                    uniqueID:global.playData.uniqueID,
                    accountID:global.playData.accountID,
                    nickName:global.playData.nickName,
                    avatarUrl:global.playData.avatarUrl
                },(err,result)=>{
                    //到这一步后即实现了一个具有回调功能的请求
                    if (err) {
                        console.log('err = ' + err);
                    }else{
                        console.log('loginscene:result = ' + JSON.stringify(result));
                        global.playerData.goldCount = result.goldCount;
                        cc.director.loadScene('hallScene');  //进入大厅
                    }
                });
                break;
            default:
                break;
        }
    }
    // update (dt) {},
});
















