import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {
        bottomLabel : cc.Label,
        rateLabel : cc.Label
    },

     onLoad () {
        this.bottomLabel.string = '底分:' + global.playerData.bottom;
        this.rateLabel.string = '倍数:' + global.playerData.rate;

     }

    // update (dt) {},
});
