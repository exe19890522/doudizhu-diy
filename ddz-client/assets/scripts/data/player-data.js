const getRandomStr = function (count) {
    let str = '';
    for (let i = 0 ; i < count ; i ++){
        str += Math.floor(Math.random() * 10);
    }
    return str;
};
//由于开发阶段无法获取微信中的数据，这里暂时使用默认数据：随机不同的名称
let PlayerData = function () {
    let that = {};
    // {
    //     uniqueID: '20000',
    //         accountID: '1000',
    //     nickName: '小强',
    //     avatarUrl: 'https://image.baidu.com/search/down?tn=download&ipn=dwnl&word=download&ie=utf8&fr=result&url=http%3A%2F%2Fwww.qqzhi.com%2Fuploadpic%2F2015-01-26%2F201846574.jpg&thumburl=https%3A%2F%2Fss0.bdstatic.com%2F70cFuHSh_Q1YnxGkpoWK1HF6hhy%2Fit%2Fu%3D3675906120%2C497992066%26fm%3D27%26gp%3D0.jpg'
    //
    // }
    that.uniqueID = '1' + getRandomStr(6);
    that.accountID = '2' + getRandomStr(6);
    that.nickName = '王小明' + getRandomStr(2);
    that.avatarUrl = 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3675906120,497992066&fm=27&gp=0.jpg';
    that.goldCount = 0;

    return that;
};
export default PlayerData;