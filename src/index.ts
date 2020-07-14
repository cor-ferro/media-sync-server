import Websocket from 'ws';
import http from 'http';
import Debug from 'debug';
import config from 'config';
import {Rooms} from './rooms';

const server = http.createServer();
const wss = new Websocket.Server({ server });
const debug = Debug('sync-server');

const ALIVE_INTERVAL = config.get<number>('alive_interval');
const PORT = config.get<number>('port');
const rooms: Rooms<Websocket> = new Rooms();

function noop() {}


type AliveWebsocket = Websocket & {
    isAlive: boolean;
}

const interval = setInterval(() => {
    wss.clients.forEach((ws: AliveWebsocket) => {
        ws.send(JSON.stringify({test: true}));
        if (ws.isAlive === false) {
            rooms.removeMember(ws);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(noop);
    });

    debug(`Count rooms: ${rooms.countRooms()}`);
}, ALIVE_INTERVAL);


type MediaSyncMessage = {
    resource: string;
    info: string;
}

wss.on('connection', (ws: AliveWebsocket) => {
    debug('new connection');

    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    ws.on('message', (message) => {
        debug(message);
        try {
            const data: MediaSyncMessage = JSON.parse(message as string);
            if (!data) {
                return;
            }

            rooms.addMember(data.resource, ws);
            rooms.forRoom(data.resource, (member) => {
                if (member !== ws && member.readyState === Websocket.OPEN) {
                    member.send(member);
                }
            });
        } catch (err) {
            debug(err);
        }
    });

    ws.on('close', () => {
        debug('close connection');
        rooms.removeMember(ws);
    });
});

wss.on('message', (data) => {
    debug('data', data);
});

wss.on('close', function close() {
    clearInterval(interval);
});

server.listen(PORT, () => {
    debug(`Server ready at ${PORT}`);
});
