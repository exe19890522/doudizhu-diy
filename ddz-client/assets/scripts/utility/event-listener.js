const EventListener = function (obj) {
    //const that ={};

    let Register ={};
    //如果注册表中有这个type就把方法push一下
    obj.on = function (type, method) {

        if (Register.hasOwnProperty(type)){
            Register[type].push(method);
        }else {
            Register[type] = [method];
        }
    };
    //检查注册表中是否有type的属性，没有就不操作，有就取出
    obj.fire = function (type) {
        if (Register.hasOwnProperty(type)){
            let handlerList = Register[type];  //取出type？？的列表
            for (let i = 0 ; i < handlerList.length ; i ++){
                let handler = handlerList[i];   //取出对象
                let args = [];
                //对参数区的长度进行遍历，arguments包含了type参数
                //从哪个1开始就可以跳过type
                for (let j = 1 ; j < arguments.length ; j ++){
                    args.push(arguments[j]);
                }
                handler.apply(this, args);
            }
        }
    };

    obj.removeListener = function (type) {
        Register[type] = [];
    };

    obj.removeAllListeners = function () {
        Register = {};
    };

    return obj;
};