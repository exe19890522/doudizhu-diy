/*import SocketController from './data/socket-controller'
import PlayerData from './data/player-data'
import EventListener from './utility/event-listener'*/
const SocketController = require('./data/socket-controller');
const PlayerData = require('./data/player-data');
const EventListener = require('./utility/event-listener');
//const Player = require('./player');

let global = {} || global;
global.playerData = PlayerData();
global.socket = SocketController();
global.eventListener = EventListener({});
export default global;

 





