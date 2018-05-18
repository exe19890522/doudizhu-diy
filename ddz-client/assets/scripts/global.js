//存储函数和各种变量
import SocketController from './data/socket-controller'
import PlayerData from './data/player-data'
import EventListener from './utility/event-listener'

const global = {} || global;
global.playerData = PlayerData();
global.socket = SocketController();
global.eventListener = EventListener({}); //由于传入的是对象 所以用一个空的{}即可

export default global;







