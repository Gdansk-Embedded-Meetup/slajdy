var fig1=new Figure(document.getElementById('canvas1'));
var fig2=new Figure(document.getElementById('canvas2'));
fig2.daspect={x:1, y:1};

var signal_x = new Dataset({x: [0, 1e-3], y:[0, 1e-3]}, "signal_x");
var signal_y = new Dataset({x: [0, 1e-3], y:[0, 1e-3]}, "signal_y");
var signal_z = new Dataset({x: [0, 1e-3], y:[0, 1e-3], z:[0, 1e-3]}, "signal_z");

var dataPlot=new DataPlot();

dataPlot.Plot(fig1,signal_x,DrawingFunctions.LinePlot);
dataPlot.Plot(fig1,signal_y,DrawingFunctions.LinePlot);
dataPlot.Plot(fig2,signal_z,DrawingFunctions.ColorScatterPlot);

dataPlot.Connect();