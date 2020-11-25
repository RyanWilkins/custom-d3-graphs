// Custom implementation of a line chart in d3.js
// Inputs:
// - svg: The element on which to append the line chart
// - height, width, margin
// - data: Using the same format that d3.csv provides
//         - assume data.columns exists. First entry is x values
//         - all further columns are y values
//            Allow for multiple x values groups - must have same domain
// -----Data is going to come in via d3 svg

import {p_bg, p_cat, p_seq} from './palettes.js';
import {standardLegend, seriesHighlights} from './standardBase.js';
import {deconstructXGroup} from './barchart.js';


/* mouseover function for line charts sourced from
https://observablehq.com/@d3/multi-line-chart
*/
function hover(svg, path, data, xScale, yScale, mLeft, mTop) {
  
    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", e => moved(e))
        .on("touchstart", e => entered(e))
        .on("touchend", e => left(e))
    else svg
        .on("mousemove", e => moved(e))
        .on("mouseenter", e => entered(e))
        .on("mouseleave", e => left(e));
  
    const dot = d3.select('#highlightDot')
  
    dot.append("circle")
        .attr("r", 2.5)
        .attr("z-index", 9999);
  
    dot.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -8);
  
    function moved(event) {
     //console.log(event)
      event.preventDefault();
      const pointer = d3.pointer(event, this);
      //console.log(pointer)
      const xm = xScale.invert(pointer[0]-mLeft);
      const ym = yScale.invert(pointer[1]-mTop);
      //console.log(xm,ym)
      const i = d3.bisectCenter(data.x_vals, xm);
      //console.log(i)
      const s = d3.least(data.series, d => Math.abs(d.values[i] - (ym)));
      //console.log(mLeft,mTop)
      path.attr("opacity", d => d === s ? 1 : 0.5).filter(d => d === s).raise();
      dot.attr("transform", `translate(${xScale(data.x_vals[i])},${yScale(s.values[i])})`);
      dot.select("text").text(s.values[i]);
    }
  
    function entered(event) {
        //console.log(event)
        //console.log("Entered")
        path.style("mix-blend-mode", null).attr("opacity", .5);
        dot.attr("display", null);
    }
  
    function left() {
      path.style("mix-blend-mode", "multiply").attr("opacity", 1);
      dot.attr("display", "none");
    }
  }


export const d3linechart = (svg,
    data, 
    graph_id, 
    {
        axis = {x: null, y: null},
        axis_format = {x: {ticks: null, tickFormat: null, tickValues: null}, y: {ticks: null, tickFormat: null, tickValues: null}},
        dims = {height : 100, width : 100}, 
        perc_margin = {top: 10, bottom: 15, left: 15, right: 1},
        showLegend = true,
        perc_legendDim = {boxDim:2, labelPad: 1, xStart:85, yStart: 0, legendHeight: 20, textPx: 12},
        highlighter = true,
        animate = {in:true, out:true}
    }
    ) => {

    const height = dims.height;
    const width = showLegend 
                    ? dims.width * perc_legendDim.xStart/100
                    : dims.width ;
    const margin = {top: perc_margin.top/100 * height,
                    bottom: perc_margin.bottom/100 * height,
                    left: perc_margin.left/100 * width,
                    right: perc_margin.right/100 * width}
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const legendDim = {
        boxDim: perc_legendDim.boxDim/100*width,
        labelPad: perc_legendDim.labelPad/100*width,
        xStart: perc_legendDim.xStart/100,
        yStart: perc_legendDim.yStart/100,
        legendHeight: perc_legendDim.legendHeight/100*height,
        textPx: perc_legendDim.textPx
    }

    // Define Scales
    var xScale = d3.scaleLinear().range([0,innerWidth]);
    var yScale = d3.scaleLinear().range([innerHeight,0]);


    // Start building the graph
    var graph = svg.selectAll(".standardLineChart")
                    .data([null])

    var graphEnter = graph.enter()
                        .append('g')
                        .attr('class', "standardGraph standardLineChart")
                        .attr("id", graph_id)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)
    // Background square
    graphEnter.append('rect')
        .attr("id", graph_id + "_bgSquare")
        .attr("x", "0")
        .attr("y", "0")
        .attr("height",dims.height)
        .attr("width", dims.width)
        .attr("fill", p_bg)
        .attr("transform", `translate(${-margin.left}, ${-margin.top})`)
        .attr("rx", "5")
    

    // Shift everything to the correct position
    var graphMerge = graphEnter.merge(graph)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)


    // Title Section
    graphEnter.append('text')
            .attr('class', "graphTitle")
            .attr('id', graph_id + "_title")
            .attr("transform", `translate(${innerWidth*.025}, ${-margin.top/4})`)
            .text("This is a Test Title")

    // Parsing data
    var x_name = data.columns[0]
    var x_values = data.map(item => {return item[x_name]})
    
    // x Scale from min x to max x
    xScale.domain([Math.min(...x_values),Math.max(...x_values)])

    // y_names will be what goes into a legend
    // Find the max of all y_values to get domain for y
    // (assume zero start - user can change later)
    var y_names = Object.keys(data[0])
    y_names.shift()
    var y_values = []
    var i;
    for (i = 0; i < y_names.length; i++){
        y_values.push(data.map(item => {return item[y_names[i]]}))
    }
    var y_max = Math.max(...y_values.map(item => {return Math.max(...item);}));
    yScale.domain([0, y_max])
    
    // Color Scale for y values
    var yCol = d3.scaleOrdinal()
            .domain(y_names)
            .range(p_cat)

    // Axes

    // x axis
    var xaxfunc = d3.axisBottom(xScale)
                    .tickFormat(axis_format.x.tickFormat === null ? null: d3.format(axis_format.x.tickFormat))
                    .ticks(axis_format.x.ticks)
                    .tickValues(axis_format.x.tickValues)

    const xaxis = graphMerge.selectAll('.graph_xaxis')
        .data([null])

    xaxis.enter()
        .append("g")
        .attr("id", graph_id + "_xaxisgroup")
        .attr("class", "graph_xaxis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xaxfunc)
        .attr("font-size", null)
        .attr("font-family", null)
        .merge(xaxis)
        .call(xaxfunc);
    
    // x label
    const xlabel  = graphMerge.selectAll('.xaxislabel')
        .data([null])
    
    xlabel.enter()
        .append("text")  
            .attr("class", "axisLabel xaxislabel")
            .attr("transform", `translate(${innerWidth/2},${innerHeight + margin.bottom*.8})`)
            .attr("text-anchor", "middle")
            .text(axis.x)
        .merge(xlabel)
            .text(axis.x)

    xaxis.exit().remove();

    // y axis
    const yaxis = graphMerge.selectAll(".graph_yaxis")
        .data([null])

    var yaxfunc = d3.axisLeft(yScale)
        .tickFormat(axis_format.y.tickFormat === null ? null: d3.format(axis_format.y.tickFormat))
        .ticks(axis_format.y.ticks)
        .tickValues(axis_format.y.tickValues)

    yaxis.enter()
        .append("g")
        .attr("class", "graph_yaxis")
        .attr("id", graph_id + "_yaxisgroup")
        .call(yaxfunc)
        .attr("font-size", null)
        .attr("font-family", null)
        .merge(yaxis)
            .call(yaxfunc);

    const ylabel  = graphMerge.selectAll('.yaxislabel')
        .data([null])
    
    yaxis.enter()
        .append("text")
        .merge(ylabel)
            .text(axis.y)
            .attr("class", "axisLabel yaxislabel")
            .attr("transform", `translate(${-margin.left*.6},${innerHeight/2})rotate(270)`)
            .attr("text-anchor","middle")
    
    yaxis.exit().remove()

    // convert data to long format
    var longData = []
    
    y_names.forEach(function(d,i){
        var temp = {series_name:d}
        var vals = []
        data.forEach(function(v,j){
            vals.push(v[d])
        })
        temp.values = [...vals]
        longData.push(Object.assign({},temp))
    })

    var chartData = {y:"y_value", x_vals: x_values, series:longData}
 
    var genLine = d3.line()
        .x(function(d,i) {return xScale(chartData.x_vals[i])})
        .y(function(d,i) {return yScale(d)})

    // Append data to line chart
    var lineGroup = graphMerge
        .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 3)
        .selectAll('path')
            .data(chartData.series)
            .enter()
            .append("path")
                .attr("class", (d,i) => {return ("graphLine " + y_names[i] +"__series")})
                .attr("d", d => genLine(d.values))
                .attr("stroke", (d,i) => {return yCol(y_names[i])})
                
                //.on("mousemove", (d,e) => {console.log(d)})
    
    // Animate Lines In
    // https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61
    const transitionPath = d3
        .transition()
        .duration(animate.in ? 2500 : 0);

    lineGroup.each(function(){
        //console.log(this.getTotalLength())
        var pathlength = this.getTotalLength()
        
    d3.select(this)
            .attr("stroke-dashoffset", pathlength)
            .attr("stroke-dasharray", pathlength)
            .transition(transitionPath)
            .attr("stroke-dashoffset", 0)
    })

    lineGroup.selectAll("path").select(function(){
        console.log(this.node().getTotalLength())
        console.log("Ran")
    })

        graphEnter.append("g")
                .attr("id","highlightDot")

        // Create Legend
        if(showLegend){

            const legendDimAdj ={
                xOffset: innerWidth + margin.right ,
                yOffset: height * legendDim.yStart + margin.top,
                boxDim: legendDim.boxDim,
                rectWidth: dims.width*(1-perc_legendDim.xStart/100) - margin.right,
                labelPad: legendDim.labelPad,
                legendHeight: legendDim.legendHeight,
                textPx: legendDim.textPx
            }
            //console.log(y_names)
            standardLegend(graphMerge, graph_id, y_names, yCol, legendDimAdj, width < 768)
    
        }

        // Highlighting on Mouseover
        highlighter
        ? svg.call(hover, lineGroup, chartData, xScale, yScale, margin.left, margin.top)
        : null

    }