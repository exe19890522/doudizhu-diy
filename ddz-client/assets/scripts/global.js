import SocketController from './data/socket-controller'
import PlayerData from './data/player-data'
import EventListener from './utility/event-listener'
const global = {} || global;
global.playerData = PlayerData();
global.socket = SocketController();
global.eventListener = EventListener({});
export default global;