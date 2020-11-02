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
                                             
    // Create group for Legend
    const legendGroup = graph.selectAll(".graphLegend")
        .data([null])

    const legendGroupEnter = legendGroup
    .enter()
        .append("g")
        .attr("class", "graphLegend")
        .attr("id", graph_id + "_legend")
        .attr("transform", `translate(${legendDim.xOffset},${legendDim.yOffset})`)
    .merge(legendGroup)
        //.attr("transform", `translate(${legendDim.xOffset},${legendDim.yOffset})`)

    const legend =  legendGroupEnter
        .selectAll(".legendEntry")      
        .data(entries, (e,i) => e+i)

    console.log(entries, entries.map(d => colorMap(d)))
        
    const legendEntry = legend
        .enter()
            .append('g')
            .attr("class", "legendEntry")

    legendEntry.append('rect')
        .attr('class', 'legendSquare')
        .merge(legend.selectAll(".legendSquare"))
            .attr('y', d => legendScale(d))
            .attr('width', legendDim.boxDim)
            .attr('height', legendDim.boxDim)
            .attr('fill', d => colorMap(d))

    legendEntry.append('text')
        .attr('class', 'legendLabel')
        .text(d => d)
        .merge(legend.selectAll(".legendLabel"))
            .attr('x', legendDim.boxDim + legendDim.labelPad)
            .attr('y', d => legendScale(d) + legendDim.boxDim/2)
            

    legend.exit().remove()

                        }

/* Fancy-fy charts with highlights on mouseover */
export const seriesHighlights = (graph,
                                    selector) => {

        graph.selectAll(selector)
        .on('mouseover', function(d,i){
        var cur_series = d3.select(this).attr('class').split(" ").filter(v => {return /__series/.test(v)});
        d3.selectAll("." + cur_series).transition()
        .duration(100)
        .style("fill-opacity", 0.7)
        })

        graph.selectAll(selector)
        .on('mouseout', function(d,i){
        var cur_series = d3.select(this).attr('class').split(" ").filter(v => {return /__series/.test(v)});
        d3.selectAll("." + cur_series).transition()
        .duration(100)
        .style("fill-opacity", 1)
        })

}