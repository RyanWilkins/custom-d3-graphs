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
                        legendDim = {xOffset:0, yOffset:0, boxDim:15, rectWidth: 10, labelPad:5, legendHeight:100, textPx:12},
                        mobile = false) => {
// Create height scale
    var legendScale = d3.scaleBand()
                        .domain(entries)
                        .range([0,legendDim.legendHeight])
                                             
    // Create group for Legend
    // This is the link that finally made this click:
    // https://stackoverflow.com/questions/42730872/d3-merge-a-nested-selection
    const legendGroup = graph.selectAll(".graphLegend")
        .data([null])

    const legendGroupEnter = legendGroup
    .enter()
        .append("g")
        .attr("class", "graphLegend")
        .attr("id", graph_id + "_legend")
        .attr("transform", `translate(${legendDim.xOffset},${legendDim.yOffset})`)
    .merge(legendGroup)

    var legend =  legendGroupEnter
        .selectAll(".legendEntry")
        .data(entries, (e,i) => {return(e)})

    //console.log(entries, entries.map(d => legendScale(d)))
        
    const legendEntry = legend
        .enter()
            .append('g')
            .attr("class", "legendEntry")

    // Squares if desktop, rectangles if mobile
    legendEntry.append('rect')
        .attr('class', 'legendSquare')
        .attr('fill', d => colorMap(d))
        .attr('width', mobile ? legendDim.rectWidth : legendDim.boxDim)
        .attr('height', legendDim.boxDim + (mobile ? legendDim.textPx : 0))

    legendEntry.append('text')
        .attr('class', 'legendLabel')
        .text(d => d)
        .attr('x', mobile ? legendDim.rectWidth/2 : (legendDim.boxDim + legendDim.labelPad) ) 
        .attr("text-anchor", mobile ? "middle" : "left")

            
    legend.exit().remove()

    var legendUpdate =legendEntry.merge(legend)

    legendUpdate.select('rect')
        .attr('y', d => (legendScale(d) - (mobile ? legendDim.textPx*3/4  : 0)))

    legendUpdate.select('text')
        .attr('y', d => legendScale(d) + legendDim.boxDim/2 )

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