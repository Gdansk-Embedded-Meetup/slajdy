DataPlot.prototype.Connect=function()
{
    this.socket=io();

    this.socket.on('UpdateDataset',(data)=>{
        if (this.datasets.hasOwnProperty(data.id))
            {
                this.datasets[data.id].Update(data.data);
            }
            else
            {
                this.RegisterDataset(new Dataset(data.data, data.id));
            }
    });
}