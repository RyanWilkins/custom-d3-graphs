// Standardized colors for consistency in graphs
import {p_bg, p_cat, p_seq} from './palettes.js';
import {linearGradient} from './palettes.js';
import {d3barchart} from './barchart.js';
import {d3linechart} from './linechart.js';

export {
    p_bg,
    p_cat,
    p_seq,
    linearGradient,
    d3barchart,
    d3linechart
}

// Defaults for quicker graphs in blogs
// i.e. only have to provide data
export const blog_barchart = (elem, data, id, xy) => {
    return (
        d3custom.d3barchart(elem, data, id, xy,
        {height: 1000, width: 2000},
        {top: 100, bottom: 110, left: 150, right: 10},
        true,
        {boxDim: 40, labelPad: 15, xStart: 0.85, yStart: 0, legendHeight: 200},
        true,
        {in: true, out: false})
    )
}