
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

// bar chart test code
$(document).ready(() => {
const testdata =  d3.csv("../testdata/catdata.csv").then((data) => {

    var graphic_width = window.innerWidth*0.9
    bcsvg.attr("width", graphic_width).attr("height", graphic_width < 768 ? graphic_width : graphic_width*0.5)

    var bc_parms =         {
                            axis : {x:"Year", y:"Value"},
                            dims : {height : +bcsvg.attr("height"), width : +bcsvg.attr("width")},
                            animate : {in:true, out:true}
                            }
    d3barchart(bcsvg, data, "mybc", bc_parms)

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
        d3barchart(bcsvg, data, "mybc", bc_parms);
    },3000) 
    setTimeout (() => { 
        d3barchart(bcsvg, datatwo, "mybc", bc_parms);
    },5000) 

 
})

// line chart test code
const linetestdata =  d3.csv("../testdata/catdata.csv").then((data) => {
    //console.log(data)
    var graphic_width = window.innerWidth*0.9
    lnsvg.attr("width", graphic_width).attr("height", graphic_width < 768 ? graphic_width : graphic_width*0.5)

    var lc_parms = {
        axis: {x: "My X Values", y: "My Y Value"},
        dims: {height : +lnsvg.attr("height"), width : +lnsvg.attr("width")},
        axis_format: {x:{tickFormat: ".0f", ticks: null, tickValues: [2011,2012,2013,2014,2015,2016]}, y: {tickFormat: ".0f", ticks:10}}
    }

    d3linechart(lnsvg, data, "mylc", lc_parms);

    d3.select("#mylc_title").text("Does this change the title?")
    //d3.select("#mylc_xaxisgroup").tickFormat(d3.format("0f"));
   

})

//const datasource = "../testdata/catdata.csv";

const bcsvg = d3.select('#bar-chart');
const lnsvg = d3.select('#line-chart');

})