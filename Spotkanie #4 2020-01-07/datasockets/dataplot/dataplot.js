class Figure {
    constructor(canvas) {

        this.daspect = { x: null, y: null };

        this.defaultStyles = [
            { lineStyle: '#0000FF', markerColor: '#0000FF', markerSize: 2 },
            { lineStyle: '#FF0000', markerColor: '#FF0000', markerSize: 2 },
            { lineStyle: '#00FF00', markerColor: '#00FF00', markerSize: 2 }
        ];

        this.ctx = canvas.getContext("2d");

        this.datasets = [];
        this.transform = (p) => { return { x: p.x * 100, y: this.ctx.canvas.height / 2 - p.y * 100 } };
        this.margin = { top: 40, right: 70, bottom: 30, left: 60 };

        this.AddDataset = (dataset) => {
            dataset.style = this.defaultStyles[this.datasets.length % this.defaultStyles.length];
            this.datasets.push(dataset);
        }

        this.Draw = () => {
            this.FitTransformToDatasets();
            this.Clear();
            this.DrawAxes();
            this.datasets.forEach(dataset => dataset.Draw(this.ctx, this.transform));
            this.DrawTicks();
        }

        this.Clear = () => {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }

        this.DrawAxes = () => {

            this.ctx.strokeStyle = '#000000';

            var origin = this.transform({ x: this.range.xmin, y: this.range.ymin });
            var xaxis = this.transform({ x: this.range.xmax, y: this.range.ymin });
            var yaxis = this.transform({ x: this.range.xmin, y: this.range.ymax });

            this.ctx.beginPath();

            this.ctx.moveTo(origin.x, origin.y);
            this.ctx.lineTo(xaxis.x, xaxis.y);
            this.ctx.moveTo(origin.x, origin.y);
            this.ctx.lineTo(yaxis.x, yaxis.y);

            this.ctx.stroke();
        }

        this.DrawTicks = () => {

            var no_ticks = 5;

            this.ctx.strokeStyle = '#000000';
            this.ctx.font = "14px Calibri";

            var xmultiplier = this.FindAxisMultiplier(this.range.xmin, this.range.xmax);
            var ymultiplier = this.FindAxisMultiplier(this.range.ymin, this.range.ymax);
            var xresolution = this.FindAxisResolution(this.range.xmin, this.range.xmax, xmultiplier);
            var yresolution = this.FindAxisResolution(this.range.ymin, this.range.ymax, ymultiplier);

            var xAxisFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: xresolution, maximumFractionDigits: xresolution });
            var yAxisFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: yresolution, maximumFractionDigits: yresolution });

            for (let i = 0; i < no_ticks; i++) {

                let x = this.range.xmin + i * (this.range.xmax - this.range.xmin) / (no_ticks - 1);
                let px = this.transform({
                    x: x,
                    y: this.range.ymin
                });
                this.ctx.strokeText(xAxisFormat.format(x / xmultiplier), px.x - 12, px.y + 16);

                let y = this.range.ymin + i * (this.range.ymax - this.range.ymin) / (no_ticks - 1);
                let py = this.transform({
                    x: this.range.xmin,
                    y: y
                });
                this.ctx.strokeText(yAxisFormat.format(y / ymultiplier), py.x - (xresolution + 1) * 12 - 10, py.y + 4);
            }

            if (xmultiplier != 1) {
                let p = this.transform({
                    x: this.range.xmax,
                    y: this.range.ymin
                });
                this.ctx.strokeText('x10', p.x + 32, p.y + 16);
                this.ctx.font = "10px Calibri";
                this.ctx.strokeText(Math.log10(xmultiplier), p.x + 53, p.y + 10);
            }

            if (ymultiplier != 1) {
                let p = this.transform({
                    x: this.range.xmin,
                    y: this.range.ymax
                });
                this.ctx.font = "14px Calibri";
                this.ctx.strokeText('x10', p.x - (xresolution + 1) * 12 + 2, p.y - 16);
                this.ctx.font = "10px Calibri";
                this.ctx.strokeText(Math.log10(ymultiplier), p.x - (xresolution + 1) * 12 + 24, p.y - 22);
            }

        }

        this.FindAxisMultiplier = (minval, maxval) => {
            var maxAbsVal = Math.max(Math.abs(minval), Math.abs(maxval));
            var exponent = Math.log10(maxAbsVal);
            var sign = Math.sign(exponent);
            var quantizedExponent = sign * Math.floor(Math.abs(exponent) / 3) * 3;
            return Math.pow(10, quantizedExponent);
        }

        this.FindAxisResolution = (minval, maxval, multiplier) => {
            var axisRange = (maxval - minval) / multiplier;
            var axisResolution = Math.ceil(-Math.log10(axisRange)) + 1;

            if (axisResolution < 2)
                axisResolution = 2;

            return axisResolution;
        }

        this.FitTransformToDatasets = () => {
            this.FindDataRange();
            this.transform = (p) => {
                return {
                    x: this.margin.left + (p.x - this.range.xmin) / (this.range.xmax - this.range.xmin) * (this.ctx.canvas.width - this.margin.left - this.margin.right),
                    y: this.margin.top + (this.range.ymax - p.y) / (this.range.ymax - this.range.ymin) * (this.ctx.canvas.height - this.margin.top - this.margin.bottom)
                }
            }
        }

        this.FindDataRange = () => {
            var ranges = [];
            this.datasets.forEach(dataset => ranges.push(dataset.range()));

            this.range = ranges[0];
            for (let i = 0; i < ranges.length; i++) {
                this.range.xmin = Math.min(ranges[i].xmin, this.range.xmin);
                this.range.ymin = Math.min(ranges[i].ymin, this.range.ymin);
                this.range.xmax = Math.max(ranges[i].xmax, this.range.xmax);
                this.range.ymax = Math.max(ranges[i].ymax, this.range.ymax);
            }

            if (this.daspect.x !== null && this.daspect.y !== null) {
                let width = this.ctx.canvas.width - this.margin.left - this.margin.right;
                let rangex = this.range.xmax - this.range.xmin;
                let scalex = width / rangex;

                let height = this.ctx.canvas.height - this.margin.top - this.margin.bottom;
                let rangey = this.range.ymax - this.range.ymin;
                let scaley = height / rangey;

                if (scalex > scaley * this.daspect.x / this.daspect.y) {
                    scalex = scaley * this.daspect.x / this.daspect.y;
                }
                else {
                    scaley = scalex * this.daspect.y / this.daspect.x;
                }

                let xc = (this.range.xmin + this.range.xmax) / 2;
                let yc = (this.range.ymin + this.range.ymax) / 2;

                this.range.xmin = xc - width / scalex / 2;
                this.range.xmax = xc + width / scalex / 2;

                this.range.ymin = yc - height / scaley / 2;
                this.range.ymax = yc + height / scaley / 2;
            }

            return this.range;
        }
    }
}

class DrawableDataset {
    constructor(dataset, drawingFun) {
        this.dataset = dataset;
        this.drawingFun = drawingFun;
        this.style = {
            lineStyle: '#0000FF',
            markerSize: 2,
            markerColor: '#0000FF'
        };

        this.Draw = (ctx, transform) => {
            this.drawingFun.plot(this.dataset.data, ctx, this.style, transform);
        };

        this.range = () => {
            return this.drawingFun.range(this.dataset.data);
        };
    }
}

DatasetIds = {
    nextId: 0,
    PullId: () => {
        this.nextId++;
        return nextId.toString();
    }
}

class Dataset {
    constructor(data, id) {

        if (id === undefined)
            id = DatasetIds.PullId();

        this.id = id;

        this.data = data;
        this.subscribers = [];
        this.Subscribe = (callback) => { this.subscribers.push(callback) };

        this.Update = (data) => {
            if (data !== undefined) {
                this.data = data;
            }
            let dataset = this;
            this.subscribers.forEach((callback) => callback(dataset));
        }
    }
}

PlotUtils = {
    rangexy: (data) => {
        let range = {};
        range.xmin = MMath.min(data.x);
        range.xmax = MMath.max(data.x);
        range.ymin = MMath.min(data.y);
        range.ymax = MMath.max(data.y);

        if (range.xmin == range.xmax)
        {
            range.xmin -= range.xmin*0.1*Math.sign(range.xmin);
            range.xmax += range.xmax*0.1*Math.sign(range.xmax);
        }

        if (range.ymin == range.ymax)
        {
            range.ymin -= range.ymin*0.1*Math.sign(range.ymin);
            range.ymax += range.ymax*0.1*Math.sign(range.ymax);
        }

        return range;
    },

    rangexyz: (data) => {
        let range = {};
        range.xmin = MMath.min(data.x);
        range.xmax = MMath.max(data.x);
        range.ymin = MMath.min(data.y);
        range.ymax = MMath.max(data.y);
        range.zmin = MMath.min(data.z);
        range.zmax = MMath.max(data.z);

        if (range.xmin == range.xmax)
        {
            range.xmin -= range.xmin*0.1*Math.sign(range.xmin);
            range.xmax += range.xmax*0.1*Math.sign(range.xmax);
        }

        if (range.ymin == range.ymax)
        {
            range.ymin -= range.ymin*0.1*Math.sign(range.ymin);
            range.ymax += range.ymax*0.1*Math.sign(range.ymax);
        }

        if (range.zmin == range.zmax)
        {
            range.zmin -= range.zmin*0.1*Math.sign(range.zmin);
            range.zmax += range.zmax*0.1*Math.sign(range.zmax);
        }

        return range;
    },

    barrangexy: (data) => {
        let range = PlotUtils.rangexy(data);
        var barWidth = (range.xmax - range.xmin) / data.x.length;

        range.xmin -= barWidth / 2;
        range.xmax += barWidth / 2;

        if (range.xmin == range.xmax)
        {
            range.xmin -= range.xmin*0.1*Math.sign(range.xmin);
            range.xmax += range.xmax*0.1*Math.sign(range.xmax);
        }

        return range;
    }
}

DrawingFunctions = {

    Histogram: (noBins) => {
        var generateHistogramData = (data) => {
            var range = PlotUtils.rangexy(data);
            var counts = new Array(noBins);

            for (var i = 0; i < noBins; i++)
                counts[i] = 0;

            for (var i = 0; i < data.y.length; i++) {
                let bin = Math.floor((data.y[i] - range.ymin) / (range.ymax - range.ymin) * noBins);
                if (bin == noBins)
                    bin = noBins - 1;
                counts[bin] += 1 / data.y.length;
            }

            return { x: linspace(range.ymin, range.ymax, noBins), y: counts };
        };

        return {
            plot: (data, ctx, style, transform) => {
                DrawingFunctions.BarPlot.plot(generateHistogramData(data), ctx, style, transform);
            },

            range: (data) => {return PlotUtils.rangexy(generateHistogramData(data)) }
        }
    },

    BarPlot: {
        plot: (data, ctx, style, transform) => {

            var range = PlotUtils.rangexy(data);
            var barWidth = (range.xmax - range.xmin) / data.x.length;

            ctx.fillStyle = style.markerColor;
            ctx.strokeStyle = '#000000';

            for (let i = 0; i < data.x.length; i++) {

                let points = [{ x: data.x[i] - barWidth / 2, y: range.ymin },
                { x: data.x[i] + barWidth / 2, y: range.ymin },
                { x: data.x[i] + barWidth / 2, y: data.y[i] },
                { x: data.x[i] - barWidth / 2, y: data.y[i] }];
                let transformedPoints = [];
                points.forEach(p => transformedPoints.push(transform(p)));

                ctx.beginPath();
                ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
                ctx.lineTo(transformedPoints[1].x, transformedPoints[1].y);
                ctx.lineTo(transformedPoints[2].x, transformedPoints[2].y);
                ctx.lineTo(transformedPoints[3].x, transformedPoints[3].y);
                ctx.lineTo(transformedPoints[0].x, transformedPoints[0].y);
                ctx.closePath();
                ctx.fill();
            }
        },

        range: PlotUtils.barrangexy
    },

    LinePlot: {
        plot: (data, ctx, style, transform) => {
            ctx.beginPath();
            ctx.strokeStyle = style.lineStyle;
            var firstPoint = transform({ x: data.x[0], y: data.y[0] });
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 0; i < data.x.length; i++) {
                let point = transform({ x: data.x[i], y: data.y[i] });
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        },

        range: PlotUtils.rangexy
    },

    ScatterPlot: {
        plot: (data, ctx, style, transform) => {

            ctx.fillStyle = style.markerColor;

            for (let i = 0; i < data.x.length; i++) {
                let point = transform({ x: data.x[i], y: data.y[i] });
                ctx.beginPath();
                ctx.lineTo(point.x, point.y);
                ctx.arc(point.x, point.y, style.markerSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        },

        range: PlotUtils.rangexy
    },

    LineScatterPlot: {
        plot: (data, ctx, style, transform) => {
            DrawingFunctions.LinePlot.plot(data, ctx, style, transform);
            DrawingFunctions.ScatterPlot.plot(data, ctx, style, transform);

        },

        range: PlotUtils.rangexy
    },

    ColorScatterPlot: {
        plot: (data, ctx, style, transform) => {
            var range = PlotUtils.rangexyz(data);

            for (let i = 0; i < data.x.length; i++) {
                let point = transform({ x: data.x[i], y: data.y[i] });
                ctx.beginPath();
                ctx.lineTo(point.x, point.y);
                ctx.arc(point.x, point.y, style.markerSize, 0, 2 * Math.PI);

                ctx.fillStyle = ColorMap.HSV(data.z[i], range.zmin, range.zmax);
                ctx.fill();
            }
        },
        range: PlotUtils.rangexy
    }
}

ColorMap = {
    HSV: (value, rangemin, rangemax) => {

        var hue = (value - rangemin) / (rangemax - rangemin) * 2 * Math.PI;
        return ColorMap.hsv2rgb(hue, 1, 1);
    },

    hsv2rgb: (hue, saturation, value) => {
        var chroma = value * saturation;
        var hue_ = hue / (Math.PI / 3);
        var x = chroma * (1 - Math.abs(hue_ % 2 - 1));

        var r = 0;
        var g = 0;
        var b = 0;

        if (hue_ <= 1) {
            r = chroma;
            g = x;
        }
        else if (hue_ <= 2) {
            r = x;
            g = chroma;
        }
        else if (hue_ <= 3) {
            g = chroma;
            b = x;
        }
        else if (hue_ <= 4) {
            g = x;
            b = chroma;
        }
        else if (hue_ <= 5) {
            r = x;
            b = chroma;
        }
        else if (hue_ <= 6) {
            r = chroma;
            b = x;
        }

        m = value - chroma;
        r = Math.floor(255 * (r + m));
        g = Math.floor(255 * (g + m));
        b = Math.floor(255 * (b + m));

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}

MMath = {
    min: (x) => Math.min.apply(null, x),
    max: (x) => Math.max.apply(null, x),
}

function linspace(start, end, num) {
    var x = new Array(num);
    for (let i = 0; i < num; i++)
        x[i] = start + i * (end - start) / (num - 1);
    return x;
}

function mf(fun, x) {
    var y = new Array(x.length);
    for (let i = 0; i < x.length; i++)
        y[i] = fun(x[i]);
    return y;
}

class DataPlot {
    constructor() {

        this.datasets = {};
        this.RegisterDataset = (dataset) => {
            this.datasets[dataset.id] = dataset;
        }


        this.Plot = (figure, dataset, drawingFun) => {
            this.RegisterDataset(dataset);
            dataset.Subscribe((dataset) => figure.Draw());
            figure.AddDataset(new DrawableDataset(dataset, drawingFun));
            figure.Draw();
        }
    }
}

if (typeof exports !== 'undefined') {
    exports.Dataset = Dataset;
    exports.DatasetId = DatasetIds;
    exports.linspace = linspace;
    exports.mf = mf;
}

