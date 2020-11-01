// Standardardized Basic Components of Graphs

// Background

// Axes

// Legend
// Input: 
//      - graph: graph object to append legend to
//      - graph_id: string for naming conventions
//      - entries: list of entries in legend
//      - colorMap: d3 scale function to map entries to colors
//      - legendDim: {xOffset, yOffset, boxDim, labelPad, legendHeight}

export const standardLegend = (graph,
                        graph_id,
                        entries,
                        colorMap,
                        legendDim = {xOffset:0, yOffset:0, boxDim:15, labelPad:5, legendHeight:100},) => {
// Create height scale
    var legendScale = d3.scaleBand()
                        .domain(entries)
                        .range([0,legendDim.legendHeight])
                                             
    // Cerate group for Legend
    const legendGroup = graph.append("g")
        .attr("class", "graphLegend")
        .attr("id", graph_id + "_legend")
        .attr("transform", `translate(${legendDim.xOffset},${legendDim.yOffset})`)

    const legendEntry =  legendGroup
        .selectAll(null)      
        .data(entries)     
        .enter()
        .append('g')
        .attr("class", "legendEntry")

    legendEntry.append('rect')
        .attr('class', 'legendSquare')
        .attr('y', d => legendScale(d))
        .attr('width', legendDim.boxDim)
        .attr('height', legendDim.boxDim)
        .attr('fill', d => colorMap(d))

    legendEntry.append('text')
        .attr('class', 'legendLabel')
        .attr('x', legendDim.boxDim + legendDim.labelPad)
        .attr('y', d => legendScale(d) + legendDim.boxDim/2)
        .text(d => d)


                        }
