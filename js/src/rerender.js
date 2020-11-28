// re-render a graph on resize 
// only re-renders if width changes by more than 20px
// to avoid 

// const rerender_graph = (graph_selection, render_func) => {
//     // Initialize width of window
//     var cur_width = $(window).width()

//     // When the window is resized (or orientation changes)
//     $(window).on('resize', function(){
//         // Check the new width
//         var temp_width = $(window).width()
//         // If width has changed by more than 20px, reload graphic
//         if(Math.abs(temp_width - cur_width) > 20){
            
//             cur_width = temp_width
//             graph_selection.html("")
//             render_func()

//         }
//     })
// }