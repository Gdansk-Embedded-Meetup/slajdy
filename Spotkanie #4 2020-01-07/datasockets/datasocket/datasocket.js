const fs = require('fs');
const socketio = require('socket.io');
const dataplot = require('dataplot');

class DataServer {

    constructor(httpServer) {
        this.wsServer = socketio(httpServer);
        this.datasets = {};
        this.sockets = {};
        this.id = 0;

        this.AddSocket = (socket) => {
            socket.id = this.id.toString();
            this.sockets[socket.id] = socket;
            this.id++;
        };

        this.RemoveSocket = (socket) => {
            delete this.sockets[socket.id];
        };

        this.AddDataset = (dataset) => {
            this.datasets[dataset.id] = dataset;
            dataset.Subscribe((ds)=>this.Broadcast(socket=>this.UpdateDataset(socket, ds.id)));
        };

        this.Broadcast = (fun)=>{
            for (var id in this.sockets) {
                if (this.sockets.hasOwnProperty(id))
                {
                    fun(this.sockets[id]);
                }  
            };
        };

        this.UpdateDataset = (socket, id) => {
            if (this.datasets.hasOwnProperty(id)) {
                let dataset = this.datasets[id];
                socket.emit('UpdateDataset', {data: dataset.data, id: id});
            }
        }

        this.wsServer.on('connection', (socket) => {
            console.log('User connected');
            this.AddSocket(socket);

            for (var id in this.datasets) {
                this.UpdateDataset(socket, id);
            }

            socket.on('disconnect', () => {
                this.RemoveSocket(socket);
                console.log('User disconnected');
            });
        });


        httpServer.on('request', (req, resp) => {
            if (req.url === '/dataplot/dataplot.js') {
                sendFile(resp, './node_modules/datasocket/node_modules/dataplot/dataplot.js')
            }
            else if (req.url === '/datasocket/dataclient.js') {
                sendFile(resp, './node_modules/datasocket/dataclient.js');
            }
        })
    }

};

function sendFile(resp, filePath) {
    var stat = fs.statSync(filePath);
    resp.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(filePath);
    readStream.pipe(resp);
}

exports.DataServer = DataServer;