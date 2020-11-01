// Standardized colors for website graphs

export const p_bg = ['#f3f3f3'];
export const p_cat = ['#649bf2', '#e78ac3', '#66c2a5', '#a6d854', '#ffd92f', '#fc8d62'];
export const p_seq = ['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#2ca25f', '#006d2c'];

// Creating a color gradient with option direction
// source: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient
// Horizontal Gradient -> set x2 to 100% (default)
// Vertical Gradient -> set y2 to 100% 
// Angled Gradient -> set x2 and y2 to 100%
// Append to a piece of the SVG using fill="url(#linear-gradient)"

export const linearGradient = (svg_el, start_col = p_seq[0], end_col = p_seq[p_seq.length-1], direction = ["0%", "0%", "100%", "0%"]) => {
    const lg_base  = svg_el.append("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", direction[0])
        .attr("y1", direction[1])
        .attr("x2", direction[2])
        .attr("y2", direction[3]);

    lg_base.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", start_col);

    lg_base.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", end_col);
}

