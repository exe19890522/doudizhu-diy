cc.Class({
    extends: cc.Component,

    properties: {
        alertLabel: cc.Label,
        cancelButton: cc.Node,
        okButton: cc.Node
    },
    initWithData(tipsStr){
        this.alertLabel.string = tipsStr;
    },
    initWithOK(tipsStr,cb){
        this.alertLabel.string = tipsStr;
        this.okCB = cb;
        this.cancelButton.active = false;
        this.okButton.x = 0;
    },
    initWithCancel(tipsStr,cb){
        this.alertLabel.string = tipsStr;
        this.cancelCB = cb;
        this.cancelButton.x = 0;
        this.okButton.active = 0;
    },
    initWithOkCancel(tipsStr,okCB, cancelCB){
        this.alertLabel.string = tipsStr;
        this.okCB = okCB;
        this.cancelCB = cancelCB;
    },
    start () {

    },
    onButtonClick(event, customData){
        switch (customData){
            case 'ok':
                if (this.okCB){
                    this.okCB();
                }
                break;
            case 'cancel':
                if (this.cancelCB){
                    this.cancelCB();
                }
                break;
            default:
                break;
        }

        this.node.destroy();
    }
});
