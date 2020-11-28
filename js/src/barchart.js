// Custom implementation of a bar chart in d3.js
// Inputs:
// - svg: The element on which to append the bar chart
// - height, width, margin
// - data: Using the same format that d3.csv provides
//         - assume data.columns exists. First entry is x values
//         - all further columns are y values
//            Allow for multiple x values groups - must have same domain
// -----Data is going to come in via d3 svg

/* Ideas to Implement:
 - Highlight bars on mousover - DONE
 - Filter on legend click
 - Animate coming in - DONE
 - Optional Gridlines

*/


import {p_bg, p_cat, p_seq} from './palettes.js';
import {standardLegend, seriesHighlights} from './standardBase.js';

/* Function to retrieve the correct X/Y values for bars.
This function takes a in a d3 formatted object where:
    input = {x_name:x_value, y_1:y_1_value ... }
            for an arbitrary number of y values.
Goal is to output:
    output = { {x_name:x_value, y_1:y_1_value}, {x_name:x_value, y_2:y_2_value} ...)
This allows for the d3 Data function to identify each entry individually */
export const deconstructXGroup = (data,
                            x_name, x_val) =>{

                                var output = [];
                                var decon = Object.entries(data);
                                decon.shift(); 
                                      
                                for (var i = 0; i <decon.length ; i++){
                                    var temp = {}
                                    temp[x_name] = x_val
                                    temp["variable"] = decon[i][0]
                                    temp["value"] = decon[i][1]
                                    output.push(temp)
                                };
                                return(output);
                            }

// Enter margin as % of width/height
export const d3barchart = (svg,
                            data, 
                            graph_id,
                            {
                            axis = {x: null, y: null}, 
                            axis_format = {
                                x: {ticks: null, tickFormat: null, tickValues: null, domain: null}, 
                                y: {ticks: null, tickFormat: null, tickValues: null, domain: null}
                            },                            
                            dims = {height : 100, width : 100}, 
                            perc_margin = {top: 10, bottom: 15, left: 15, right: 1},
                            showLegend = true,
                            perc_legendDim = {boxDim:2, labelPad: 1, xStart:85, yStart: 0, legendHeight: 20, textPx: 12},
                            highlighter = true,
                            animate = {in:true, out:true},
                            bare = false
                            } 
                            ) => {

    const height = dims.height;
    const width = showLegend 
                    ? dims.width * (perc_legendDim.xStart ? perc_legendDim.xStart : 85) / 100
                    : dims.width ;
    const margin = {top: perc_margin.top/100 * height,
                    bottom: perc_margin.bottom/100 * height,
                    left: perc_margin.left/100 * width,
                    right: perc_margin.right/100 * width}
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const legendDim = {
        boxDim: (perc_legendDim.boxDim ? perc_legendDim.boxDim : 2) / 100 * width,
        labelPad: (perc_legendDim.labelPad ? perc_legendDim.labelPad : 1) / 100 * width,
        xStart: (perc_legendDim.xStart ? perc_legendDim.xStart : 85 ) / 100,
        yStart: (perc_legendDim.yStart ? perc_legendDim.yStart : 0) / 100,
        legendHeight: (perc_legendDim.legendHeight ? perc_legendDim.legendHeight : 20) / 100 * height,
        textPx: (perc_legendDim.textPx ? perc_legendDim.textPx : 12)
    }

    // Define Scales
    var xScale = d3.scaleBand().range([0,innerWidth]).padding(0.2);
    var yScale = d3.scaleLinear().range([innerHeight,0]);

    // Start building the graph
    var graph = svg.selectAll(".standardBarChart")
                    .data([null])

    var graphEnter = graph.enter()
                        .append('g')
                        .attr('class', "standardGraph standardBarChart")
                        .attr("id", graph_id)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    
    var graphMerge = graphEnter.merge(graph)
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

    // Title Section
    graphEnter.append('text')
            .attr('class', "graphTitle")
            .attr('id', graph_id + "_title")
            .attr("transform", `translate(${innerWidth*.025}, ${-margin.top/4})`)
            .text("This is a Test Title")

    // Parsing data
    var x_name = data.columns[0]
    var x_values = data.map(item => {return item[x_name]})
    // Discrete Bars
    axis_format.x.domain
        ? xScale.domain(axis_format.x.domain)
        : xScale.domain(x_values)

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

    axis_format.y.domain
        ? yScale.domain(axis_format.y.domain)
        : yScale.domain([0, y_max])
    
    // Color Scale for y values
    var yCol = d3.scaleOrdinal()
            .domain(y_names)
            .range(p_cat)

    // Axes

    // x axis
    const xaxis = graphMerge.selectAll('.graph_xaxis')
        .data([null])

    var xaxfunc = d3.axisBottom(xScale)
                .tickFormat(axis_format.x.tickFormat ? axis_format.x.tickFormat : null)
                .ticks(axis_format.x.ticks ? axis_format.x.ticks : null)
                .tickValues(axis_format.x.tickValues ? axis_format.x.tickValues : null)

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
        .tickFormat(axis_format.y.tickFormat ? axis_format.y.tickFormat : null)
        .ticks(axis_format.y.ticks ? axis_format.y.ticks : null)
        .tickValues(axis_format.y.tickValues ? axis_format.y.tickValues : null)

    yaxis.enter()
        .append("g")
        .attr("class", "graph_yaxis")
        .attr("id", graph_id + "_yaxisgroup")
        .call(yaxfunc)
        .attr("font-size", null)
        .attr("font-family", null)
        .merge(yaxis)
            .call(yaxfunc);
    
    yaxis.exit().remove()

    // y label
    const ylabel  = graphMerge.selectAll('.yaxislabel')
        .data([null])

    yaxis.enter()
        .append("text")
        .merge(ylabel)
            .text(axis.y)
            .attr("class", "axisLabel yaxislabel")
            .attr("transform", `translate(${-margin.left*.6},${innerHeight/2})rotate(270)`)
            .attr("text-anchor","middle")

    // Append data to bar chart
    // TODO: I feel like the data[0] line shouldn't work... it doesn't throw any errors though
    const barStart = graphMerge.selectAll('.graphXGroup').data(data, (e) => {return (x_name + e[x_name]);})
        
    const barEnter = barStart.enter()

    barStart.exit().remove()
       
    // For each row of the data, deconstruct it and 
    // create a bar for each series value. XAxis groups are created.
     const xgroupStart = barEnter 
        .append("g")
            .attr("class", "graphXGroup")
            .attr("transform", (d,i) => {return (`translate(${xScale(d[x_name])},0)`)})
        .merge(barStart) 
        .selectAll(".graphBar")
            .data(d => {return deconstructXGroup(d,x_name,d[x_name])}, (e) => {
                var barid = e[x_name] + e.variable;
                return(barid);
            })

    const xgroupenter = xgroupStart
        .enter()
        .append("rect")
            .attr("class", (d,i) => "graphBar " + d.variable + "__series")
            .attr("x",(d,i) => xScale.bandwidth()/y_names.length * i)
            .attr("fill", d => {return yCol(d.variable)})
            .attr("y",innerHeight) 
            .attr("height",0)
        .merge(xgroupStart) 
            .transition()
            .duration(animate.in ? 1000 :0) 
                .attr("x",(d,i) => xScale.bandwidth()/y_names.length * i)
                .attr("height", (d,i) => {return (innerHeight - yScale(d.value))})
                // make width of bars zero if we just want bare graph
                .attr("width", bare ? 0 : xScale.bandwidth()/y_names.length)
                .attr("y", d => {return yScale(d.value)}) 

            
    const xgroupexit = xgroupStart
        .exit()
            .transition()
            .duration(animate.out ? 250 : 0) 
            .attr("opacity", 0.5)
            .transition()
            .duration(animate.out ? 1000 : 0)
            .attr("y",innerHeight)
            .attr("height", 0)
            .remove()
  
    // Create Legend
    if(showLegend){

        const legendDimAdj ={
            xOffset: innerWidth + margin.right,
            yOffset: height * legendDim.yStart + margin.top,
            boxDim: legendDim.boxDim,
            rectWidth: dims.width*(1-legendDim.xStart) - margin.right,
            labelPad: legendDim.labelPad,
            legendHeight: legendDim.legendHeight,
            textPx: legendDim.textPx
        }
        //console.log(y_names)
        standardLegend(graphMerge, graph_id, y_names, yCol, legendDimAdj, legendDimAdj.rectWidth < 75)

    }

    // Optional Embellishments

    // Highlighting on Mouseover
    highlighter
        ? seriesHighlights(graphMerge,".graphBar")
        : null

}

// Defaults for quicker graphs in blogs
// i.e. only have to provide data
export const blog_barchart = (elem, data, id, xy) => {
        d3barchart(elem, data, id, xy,
            {height : +elem.attr("height"), width : +elem.attr("width")},
            {top: 10, bottom: 15, left: 10, right: 1},
            true,
            {boxDim:1.5, labelPad: 1, xStart:85, yStart: 0, legendHeight: 15},
            true,
            {in:true, out:false});
}