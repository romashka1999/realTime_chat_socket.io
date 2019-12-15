import express ,{ Application, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';


class App {

    private app: Application;
    private server: Server
    private io: any;

    public constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
        this.server = createServer(this.app);
        this.io = require('socket.io')(this.server);
    }


    private middlewares() {
        dotenv.config();

        const PORT = process.env.SERVER_PORT || 3000;
        this.app.set('port', PORT);

        this.app.use(morgan('dev'));

        this.app.use(cors());
        this.app.use((req: Request, res: Response, next: NextFunction) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                if(req.method === "OPTIONS"){
                    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
                    return res.status(200).json({});
                }
                next();
        });

        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());
    }

    private routes() {
        this.app.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.sendFile(__dirname +'/index.html')
        });
    }

    public start() {
        this.server.listen(this.app.get('port'), () => {
            console.log(`realTimeChatService server successfully listening to the port: ${this.app.get('port')}`);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client ');
        
            this.io.emit('noOfConnections', Object.keys(this.io.sockets.connected).length);
        
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                this.io.emit('noOfConnections', Object.keys(this.io.sockets.connected).length)
            });
        
            socket.on('chat', (msg: any) => {
                socket.broadcast.emit('chat', msg)
            })
            socket.on('joined', (name: any) => {
                socket.broadcast.emit('joined', name)
            })
            socket.on('leaved', (name: any) => {
                socket.broadcast.emit('leaved', name)
            })
        
            socket.on('typing', (data: any) => {
                socket.broadcast.emit('typing', data)
            })
            socket.on('stoptyping', () => {
                socket.broadcast.emit('stoptyping')
            })
        });
    }

}


export default App;