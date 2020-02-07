const express=require('express');
const http = require('http');
const datasocket = require('datasocket');
const dataplot = require('dataplot');

var app = express();
var httpServer = http.Server(app);
var dataServer = new datasocket.DataServer(httpServer);

app.use(express.static('public'));
httpServer.listen(3000, () => { console.log('Server running on port 3000') });


var signal_x = new dataplot.Dataset({x: [], y:[]},"signal_x");
var signal_y = new dataplot.Dataset({x: [], y:[]},"signal_y");
var signal_z = new dataplot.Dataset({x: [], y:[], z:[]},"signal_z");
dataServer.AddDataset(signal_x);
dataServer.AddDataset(signal_y);
dataServer.AddDataset(signal_z);

setInterval(()=>{
    var fi = dataplot.linspace(0, 2*Math.PI, 100);
    
    signal_x.data =
    {
        x: fi,
        y: dataplot.mf(x=>Math.cos(x)+Math.random()*0.1, fi)
    }

    signal_y.data=
    {
        x: fi,
        y: dataplot.mf(x=>Math.sin(x)+Math.random()*0.1, fi)
    }

    signal_z.data=
    {
        x: signal_x.data.y,
        y: signal_y.data.y,
        z: fi
    }

    signal_x.Update();
    signal_y.Update();
    signal_z.Update();
}, 200);