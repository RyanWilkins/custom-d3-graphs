
//import fbFunction from '.fruitBowl.js';
//import {fruitBowl as fb} from './fruitBowl.js'; 
//const fruitBowl = require('./fruitBowl.js');

// Standardized colors for consistency in graphs
import {p_bg, p_cat, p_seq} from './src/palettes.js';
import {linearGradient} from './src/palettes.js';
import {d3barchart} from './src/barchart.js';

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


const testdata =  d3.csv("../testdata/catdata.csv").then((data) => {
    d3barchart(bcsvg, data, "mybc", {height : +bcsvg.attr("height"), width : +bcsvg.attr("width")},
        {top: 40, bottom: 40, left: 50, right: 10},
        true);
    /*d3.selectAll(".value__series")
        .attr("fill","orange").style("fill-opacity", 1)
        .exit()
            .transition().duration(500)
            .attr("height", 0)
            .remove();*/

    //console.log(data)
    var datatwo = data.map(x => {var y = Object.assign({},x);
                                y.key3 = y.value*2;
                                return y;
                            })
    datatwo.columns = [...data.columns]
    datatwo.columns.push("key3")

    //console.log(datatwo);
    //console.log(data);
    for (var i = 0; i < data.length;i++){
        delete data[i].otherval
    }

   /* setTimeout(() =>{
        d3.select("#mybc").html(null)
        d3barchart(bcsvg, datatwo, "mybc", {height : +bcsvg.attr("height"), width : +bcsvg.attr("width")},
        {top: 40, bottom: 40, left: 50, right: 10},
        true);
    },3000)*/
    setTimeout (() => {
        //data.pop();
        // console.log(data); 
        //d3.select("#mybc").html(null)
        d3barchart(bcsvg, data, "mybc", {height : +bcsvg.attr("height"), width : +bcsvg.attr("width")},
        {top: 40, bottom: 40, left: 50, right: 10},
        true);
    },3000) 

 
})

//const datasource = "../testdata/catdata.csv";

const bcsvg = d3.select('#bar-chart');

