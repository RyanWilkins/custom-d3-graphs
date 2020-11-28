
//import fbFunction from '.fruitBowl.js';
//import {fruitBowl as fb} from './fruitBowl.js'; 
//const fruitBowl = require('./fruitBowl.js');

// Standardized colors for consistency in graphs
import {p_bg, p_cat, p_seq} from './src/palettes.js';
import {linearGradient} from './src/palettes.js';
import {d3barchart} from './src/barchart.js';
import {d3linechart} from './src/linechart.js';

// Categorical colors (max 6)
const colorCat = d3.scaleOrdinal()
    .range(p_cat);

// Sequential colors, max six, in categoricals
const colorSeq = d3.scaleOrdinal()
    .range(p_seq);

// Sequential colors, using d3 to create sequence 


const svg = d3.select('#fruits');

linearGradient(svg)
svg.style("fill", "url(#linear-gradient)");

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = (selection, props) => {
    const circles = selection.selectAll('circle')
        .data(props, d => d.id);
    //console.log(selection);
    circles
        .enter().append('circle')
            .attr('cx', (d,i) => i*100 + 70)
            .attr('cy', height/2)
            .attr('r', 0)
        .merge(circles)
            .attr('fill', d => colorScale(d.type))
        .transition().duration(500)
            .attr("r", d => radiusScale(d.type))
            .attr('cx', (d,i) => i*100 + 70);

    circles
        .exit()
            .transition().duration(500)
                .attr("r", 0)
            .remove();
};


const colorScale = d3.scaleOrdinal()
    .domain(['apple','lemon'])
    .range(['#c11d1d', '#fcbe03']);

const radiusScale = d3.scaleOrdinal()
    .domain(['apple','lemon'])
    .range([45,30]);

const makeFruit = type => ({
    type,
    id: Math.random()
});

let fruits = d3.range(5).map(() => makeFruit('apple'));


render(svg, fruits);

setTimeout(() => {
    fruits.pop();
    render(svg,fruits);
},1000)

setTimeout(() => {
    fruits[2].type = 'lemon';
    render(svg,fruits);
},2000)

// Eat the second Apple

setTimeout (() => {
    fruits = fruits.filter((d,i) => i !== 1);
    render(svg,fruits);
},3000) 

$(document).ready(() => {



    var render_adj = () => {
        var graph = d3.select('#adj-graph')
        var graph_width = Math.min($('#covid-graph-inner').width(),800)
        graph.attr("width", graph_width).attr("height", graph_width)

        var graph_parameters = {
            axis: {x: "Date", y: "Cumulative Deaths"},
            dims: {height: graph_width, width: graph_width},
            axis_format: {
                x: {ticks: 6, tickFormat: d3.timeFormat("%m/%Y")},
                y: {ticks: null, tickFormat: graph_width < 500 ? d3.format(".2s") : null}
            },
            perc_margin: {
                top: 10,
                left: graph_width < 500 ? 20 : 15,
                bottom: graph_width < 500 ? 15 : 10,
                right: 3,
            },
            perc_legendDim: {
                legendHeight: 40,
                xStart: 92
            },
            animate: {in: false, out: false},
            bare: true
        }

        d3.csv("../testdata/cv_dth_six_states.csv").then((data) => {

            data.forEach(d => {
                d.date = Date.parse(d.date)
            });

            d3linechart(graph, data, "cv_deaths_adj", graph_parameters)
            d3.select('#cv_deaths_adj_title').text("Cumulative Covid Deaths by State")

        })

    }

    render_adj()

    $(window).on('resize', function(){
        setTimeout(function(){
            d3.select('#adj-graph').html("")
            render_adj() }, 100)
    })

})




// bar chart test code
$(document).ready(() => {
const testdata =  d3.csv("../testdata/catdata.csv").then((data) => {

    var graphic_width = window.innerWidth*0.9
    bcsvg.attr("width", graphic_width).attr("height", graphic_width < 768 ? graphic_width : graphic_width*0.5)

    var bc_parms =         {
                            axis : {x:"Year", y:"Value"},
                            dims : {height : +bcsvg.attr("height"), width : +bcsvg.attr("width")},
                            animate : {in:true, out:true},
                            bare: true
                            }
    d3barchart(bcsvg, data, "mybc", bc_parms)

    setTimeout (() => {
        bc_parms.bare = false
        d3barchart(bcsvg, data, "mybc", bc_parms);
    },2000) 

    var datathree = Object.assign(data)
    var datatwo = data.map(x => {var y = Object.assign({},x);
                                y.key3 = y.value*2;
                                return y;
                            })
    datatwo.columns = [...data.columns]
    datatwo.columns.push("key3")

    for (var i = 0; i < data.length;i++){
        delete data[i].otherval
    }

    setTimeout (() => {
        bc_parms.bare = false
        d3barchart(bcsvg, data, "mybc", bc_parms);
    },5000) 
    setTimeout (() => { 
        d3barchart(bcsvg, datatwo, "mybc", bc_parms);
    },6000) 

 
})
})

// // line chart test code
// const linetestdata =  d3.csv("../testdata/catdata.csv").then((data) => {
//     //console.log(data)
//     var graphic_width = window.innerWidth*0.9
//     lnsvg.attr("width", graphic_width).attr("height", graphic_width < 768 ? graphic_width : graphic_width*0.5)

//     var lc_parms = {
//         axis: {x: "My X Values", y: "My Y Value"},
//         dims: {height : +lnsvg.attr("height"), width : +lnsvg.attr("width")},
//         perc_legendDim: {legendHeight:40},
//         axis_format: {
//             x: {tickFormat: d3.format(".0f"), tickValues: [2011,2012,2013,2014,2015, 2016]}, 
//             y: {tickFormat: d3.format(".0f"), ticks:10}}
//     }

//     d3linechart(lnsvg, data, "mylc", lc_parms);

//     d3.select("#mylc_title").text("Does this change the title?")
//     //d3.select("#mylc_xaxisgroup").tickFormat(d3.format("0f"));
   

// })

// //const datasource = "../testdata/catdata.csv";

 const bcsvg = d3.select('#bar-chart');
// const lnsvg = d3.select('#line-chart');

// })