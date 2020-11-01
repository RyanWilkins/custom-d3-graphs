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
 - Highlight bars on mousover
 - Filter on legend click
 - Animate coming in

*/


import {p_bg, p_cat, p_seq} from './palettes.js';
import {standardLegend} from './standardBase.js';

export const d3barchart = (svg,
                            data, 
                            graph_id, 
                            dims = {height : 100, width : 100}, 
                            margin = {top: 10, bottom: 10, left: 10, right: 10},
                            showLegend = true,
                            legendDim = {boxDim:15, labelPad: 5, xStart:0.85, yStart: 0, legendHeight: 100}
                            ) => {

    const height = dims.height;
    const width = showLegend 
                    ? dims.width * legendDim.xStart
                    : dims.width ;
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    console.log("full width is: " + width)
    console.log("graph width is: " + innerWidth)

    // Define Scales
    var xScale = d3.scaleBand().range([0,innerWidth]).padding(0.2);
    var yScale = d3.scaleLinear().range([innerHeight,0]);


    // Start building the graph
    var graph = svg.append('g')
                    .attr('class', "standardGraph")
                    .attr('class', "standardBarChart")
                    .attr("id", graph_id)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    

    console.log("I ran")

    // Title Section
    graph.append('text')
            .attr('class', "graphTitle")
            .attr('id', graph_id + "_title")
            .attr("transform", `translate(0, ${0})`)
            .text("This is a Test Title")

    // Parsing data
    var x_name = data.columns[0]
    var x_values = data.map(item => {return item[x_name]})
    // Discrete Bars
    xScale.domain(x_values)

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
    graph.append("g")
        .attr("id", graph_id + "_xaxisgroup")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));

    graph.append("g")
        .attr("id", graph_id + "_yaxisgroup")
        .call(d3.axisLeft(yScale));
    
    // Append data to bar chart
    const barenter = graph.selectAll('.graphBar')
        .data(data)
        .enter()

    // Loops through each of the y values
    // and creates bars with width equal to
    // x axis bandwidth divided by number of categories
    var j = 0;
    for (j = 0; j < y_names.length; j++){   
     barenter       
        .append("rect")
            .attr("class", "graphBar")
            .attr("x", d => {return xScale(d[x_name]) + xScale.bandwidth()/y_names.length * j})
            .attr("y", d => {return yScale(d[y_names[j]])})
            .attr("width", xScale.bandwidth()/y_names.length)
            .attr("height", d => {return (innerHeight - yScale(d[y_names[j]]))})
            .attr("fill", d => {return (yCol(y_names[j]))})
    }

    // Create Legend
    if(showLegend){
        const legendDimAdj ={
            xOffset: width * legendDim.xStart + margin.left,
            yOffset: height * legendDim.yStart + margin.top,
            boxDim: legendDim.boxDim,
            labelPad: legendDim.labelPad,
            legendHeight: legendDim.legendHeight
        }

    standardLegend(graph, graph_id, y_names, yCol, legendDimAdj)
   /*
    // Vertical scale for legend placement
        var legendScale = d3.scaleBand()
                        .domain(y_names)
                        .range([0,100])


        const legendGroup = graph.append("g")
            .attr("class", "graphLegend")
            .attr("id", graph_id + "_legend")
            .attr("transform", `translate(${width*legendDim.xStart + margin.left},${legendDim.yStart*height + margin.top})`)
         
        const legendEntry =  legendGroup
            .selectAll(null)      
            .data(y_names)     
                .enter()
                .append('g')
                .attr("class", "legendEntry")
    
        legendEntry.append('rect')
                    .attr('class', 'legendSquare')
                    .attr('y', d => legendScale(d))
                    .attr('width', legendDim.boxDim)
                    .attr('height', legendDim.boxDim)
                    .attr('fill', d => yCol(d))
        
        legendEntry.append('text')
                    .attr('class', 'legendLabel')
                    .attr('x', legendDim.boxDim + legendDim.labelPad)
                    .attr('y', d => legendScale(d) + legendDim.boxDim/2)
                    .text(d => d)
    */
                }

    console.log("pause here")

}