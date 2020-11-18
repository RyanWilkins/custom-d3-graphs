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
                                //console.log(decon)
                                decon.shift();        
                                for (var i = 0; i <decon.length ; i++){
                                    //console.log(pair)
                                    var temp = {}
                                    temp[x_name] = x_val
                                    temp["variable"] = decon[i][0]
                                    temp["value"] = decon[i][1]
                                    output.push(temp)
                                };
                                //console.log(output)
                                return(output);
                            }


export const d3barchart = (svg,
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
            .attr("transform", `translate(0, ${-margin.top/4})`)
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

    // x axis
    const xaxis = graphMerge.selectAll('.graph_xaxis')
        .data([null])

    xaxis.enter()
        .append("g")
        .attr("id", graph_id + "_xaxisgroup")
        .attr("class", "graph_xaxis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .merge(xaxis)
        .call(d3.axisBottom(xScale));
    
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

    /*graphMerge.append("g")
        .attr("id", graph_id + "_yaxisgroup")
        .call(d3.axisLeft(yScale));*/
    
    // Append data to bar chart
    const barStart = graphMerge.selectAll('.graphXGroup')
        .data(data, (e) => {
            //console.log(x_name + e[x_name]);
            return (x_name + e[x_name]);
        })
        
    const barEnter = barStart.enter()

    barStart.exit().remove()
       
    // For each row of the data, deconstruct it and 
    // create a bar for each series value. XAxis groups are created.
     const xgroupStart = barEnter 
        .append("g")
            .attr("class", "graphXGroup")
            .attr("transform", (d,i) => {return (`translate(${xScale(d[x_name])},0)`)})
            //.attr("asd", (d,i) => {console.log(d); return 0})
        .merge(barStart) 
            //.attr("transform", (d,i) => {return (`translate(${xScale(d[x_name])},0)`)})
        .selectAll(".graphBar")
            .data(d => {return deconstructXGroup(d,x_name,d[x_name])}, (e) => {
                var barid = e[x_name] + e.variable;
                //console.log(barid)
                return(barid);
            })

    const xgroupenter = xgroupStart
        .enter()
        .append("rect")
            .attr("class", (d,i) => "graphBar " + d.variable + "__series")
            .attr("x",(d,i) => xScale.bandwidth()/y_names.length * i)
            //.attr("width", xScale.bandwidth()/y_names.length)
            //.attr("y", d => {return yScale(d.value)})
            //.attr("height", (d,i) => {return (innerHeight - yScale(d.value))})
            .attr("fill", d => {return yCol(d.variable)})
            .attr("y",innerHeight) 
            .attr("height",0)
        .merge(xgroupStart) 
            .transition()
            .duration(animate.in ? 1000 :0) 
                .attr("x",(d,i) => xScale.bandwidth()/y_names.length * i)
                //.attr("y",0) 
                //.attr("y", d => {return yScale(d.value)})
                //.attr("fill", d => {return yCol(d.variable)})
                .attr("height", (d,i) => {return (innerHeight - yScale(d.value))})
                .attr("width", xScale.bandwidth()/y_names.length)
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
            xOffset: width * legendDim.xStart + margin.left,
            yOffset: height * legendDim.yStart + margin.top,
            boxDim: legendDim.boxDim,
            labelPad: legendDim.labelPad,
            legendHeight: legendDim.legendHeight
        }
        //console.log(y_names)
        standardLegend(graphMerge, graph_id, y_names, yCol, legendDimAdj)

    }

    // Optional Embellishments

    // Highlighting on Mouseover
    highlighter
        ? seriesHighlights(graphMerge,".graphBar")
        : null

}
