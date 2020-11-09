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

    /*const dot = svg.append("g")
        .attr("display", "none");*/
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);
  
    function moved(event) {
     console.log(event)
      event.preventDefault();
      const pointer = d3.pointer(event, this);
      console.log(pointer)
      const xm = xScale.invert(pointer[0]-mLeft);
      const ym = yScale.invert(pointer[1]-mTop);
      console.log(xm,ym)
      const i = d3.bisectCenter(data.x_vals, xm);
      console.log(i)
      const s = d3.least(data.series, d => Math.abs(d.values[i] - (ym)));
      //console.log(mLeft,mTop)
      path.attr("opacity", d => d === s ? 1 : 0.5).filter(d => d === s).raise();
      dot.attr("transform", `translate(${xScale(data.x_vals[i])},${yScale(s.values[i])})`);
      //dot.select("text").text(s.name);
    }
  
    function entered(event) {
        console.log(event)
        console.log("Entered")
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
    dims = {height : 100, width : 100}, 
    margin = {top: 10, bottom: 10, left: 10, right: 10},
    showLegend = true,
    legendDim = {boxDim:15, labelPad: 5, xStart:0.85, yStart: 0, legendHeight: 100},
    highlighter = true,
    animate = {in:true, out:true}
    ) => {

    const height = dims.height;
    const width = showLegend 
                    ? dims.width * legendDim.xStart
                    : dims.width ;
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

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
    graphEnter.append("g")
            .attr("id","highlightDot")
                    
    var graphMerge = graphEnter.merge(graph)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Title Section
    graphEnter.append('text')
            .attr('class', "graphTitle")
            .attr('id', graph_id + "_title")
            .attr("transform", `translate(0, ${-margin.top/2})`)
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
    const xaxfunc = d3.axisBottom(xScale)
        //delete this line later
        .tickFormat(d3.format(".0f"))

    const xaxis = graphMerge.selectAll('.graph_xaxis')
        .data([null])

    xaxis.enter()
        .append("g")
        .attr("id", graph_id + "_xaxisgroup")
        .attr("class", "graph_xaxis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xaxfunc)
        .merge(xaxis)
        .call(xaxfunc);
    
    xaxis.exit().remove();

    

    // y axis
    const yaxis = graphMerge.selectAll(".graph_yaxis")
        .data([null])

    yaxis.enter()
        .append("g")
        .attr("class", "graph_yaxis")
        .attr("id", graph_id + "_yaxisgroup")
        .call(d3.axisLeft(yScale))
        .merge(yaxis)
            .call(d3.axisLeft(yScale));
    
    yaxis.exit().remove()

    // convert data to long format
    var longData = []
    
    y_names.forEach(function(d,i){
        var temp = {series_name:d}
        var vals = []
        data.forEach(function(v,j){
            vals.push(v[d])
            //console.log(v[d])
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
            .attr("stroke-width", 1.5)
        .selectAll('path')
            .data(chartData.series)
            .enter()
            .append("path")
                .attr("class", (d,i) => {return ("graphLine " + y_names[i] +"__series")})
                .attr("d", d => genLine(d.values))
                .attr("stroke", (d,i) => {return yCol(y_names[i])})  
                //.on("mousemove", (d,e) => {console.log(d)})

        // Create Legend
        if(showLegend){

            const legendDimAdj ={
                xOffset: width * legendDim.xStart + margin.left,
                yOffset: height * legendDim.yStart + margin.top,
                boxDim: legendDim.boxDim,
                labelPad: legendDim.labelPad,
                legendHeight: legendDim.legendHeight
            }
            //console.log(y_names)
            standardLegend(graphMerge, graph_id, y_names, yCol, legendDimAdj)
    
        }

        // Highlighting on Mouseover
        highlighter
        ? svg.call(hover, lineGroup, chartData, xScale, yScale, margin.left, margin.top)
        : null

    }