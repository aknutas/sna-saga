//Listeners
$(document).ready(onStart());

//Globs
var Network = [];
var centralityArray = [];

//Hardcoded conf values, bad (but it works)
var minNodeSize = 20;
var maxNodeSize = 3*minNodeSize;


var maxNodeWeight = null;
var minNodeWeight = null;

function Node(id, target, weight) {
    this.id = id;
    this.target = target;
    this.weight = weight;
}

function onStart() {
    startLoad();
}

function startLoad() {
    $.ajax({
        url: "sample-data/sample-network.json",
        cache: false,
        dataType: "json",
    }).fail(function() {
        alert("Data load failed!");
    }).done(function(data) {
        loadReady(data);
    });
}

function loadReady(data) {
    $.each(data, function(index, value) {
        var nodeX = new Node(value.source, value.target, value.weight);
        Network.push(nodeX);
    });
    //Calculate centralities
    goCalc(Network, centralityArray);
    //Draw graph
    drawGraph(Network);
}

function drawGraph(graphsrc) {

    var graph = Viva.Graph.graph();
    var graphics = Viva.Graph.View.svgGraphics(),
        nodeSize = minNodeSize; // Default node size



    var graphGenerator = Viva.Graph.generator();
    var graph = graphGenerator.ladder(1000);

    var graph = graphGenerator.grid(5, 6);
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 300, // link length
        springCoeff: 10e-25,
        dragCoeff: 0,
        gravity: -0.6
  //    theta: 1
    });

    for (var i = 0; i < 150; ++i) {
        layout.step();
    }

    graphsrc.forEach(function(node) {
        graphics.node(function(node) {
            //Try to find and assign custom attributes
            if(typeof centralityArray[node.id] != 'undefined'){
                nodeSize = minNodeSize + ((maxNodeSize - minNodeSize) * (centralityArray[node.id]) / maxNodeWeight);
            } else {
                nodeSize = minNodeSize;
            }

            // This time it's a group of elements: http://www.w3.org/TR/SVG/struct.html#Groups
            var ui = Viva.Graph.svg('g'),
                // Create SVG text element with user id as content
                svgText = Viva.Graph.svg('text')
                .attr('font-size', 70)
                .attr('stroke', 'white')
                .attr('y', '-2px').text(node.id),

                img = Viva.Graph.svg('image')
                .attr('width', nodeSize)
                .attr('height', nodeSize)
                .link('https://secure.gravatar.com/avatar/' + node.data);
            ui.append(svgText);
            ui.append(img);

            ui.addEventListener('click', function() {
                // toggle pinned mode
                layout.pinNode(node, !layout.isNodePinned(node));
            });

            return ui;

        }).placeNode(function(nodeUI, pos) {
            // 'g' element doesn't have convenient (x,y) attributes, instead
            // we have to deal with transforms: http://www.w3.org/TR/SVG/coords.html#SVGGlobalTransformAttribute
            var pozX = (pos.x - nodeSize / 2);
            var pozY = (pos.y - nodeSize / 2);

            nodeUI.attr('transform',
                'translate(' +
                (pozX) + ',' + (pozY) + ')');

        });

        graph.addLink(node.id, node.target);

        graphics.link(function(link) {

            return Viva.Graph.svg('path')
                //.attr('length', 10)
                .attr('stroke', 'maroon') //  #656565 dark grey
                .attr('stroke-width', 7)
                .attr('stroke-dasharray', '3, 4');
        }).placeLink(function(linkUI, fromPos, toPos) {
            // linkUI - is the object returend from link() callback above.
            var data = 'M' + fromPos.x + ',' + fromPos.y +
                'L' + toPos.x + ',' + toPos.y;
            // 'Path data' (http://www.w3.org/TR/SVG/paths.html#DAttribute )
            // is a common way of rendering paths in SVG:
            linkUI.attr("d", data);
        });
    });

    var renderer = Viva.Graph.View.renderer(graph, {
        layout: layout,
        graphics: graphics,
        renderLinks: true,
        prerender: true
        //container : document.getElementById('graphContainer')
    });
    renderer.run();

}

function goCalc(calcNet, centResults) {
    //Calculate centrality and other measures, and store the results into an array
    var graphData = Viva.Graph.graph();
    
    calcNet.forEach(function(node) {
        graphData.addLink(node.id, node.target);
    });

    var centrality = Viva.Graph.centrality();
    var betweenness = centrality.betweennessCentrality(graphData);

    var counter = 0;
    var newTableRow;
    
    
    $.each(betweenness, function(index, value) {
        // Store results
        centResults[value.key] = value.value;
        if(maxNodeWeight === null) {
            maxNodeWeight = value.value;
        } else if (maxNodeWeight < value.value) {
            maxNodeWeight = value.value;
        }
        if(minNodeWeight === null) {
            minNodeWeight = value.value;
        } else if (minNodeWeight > value.value) {
            minNodeWeight = value.value;
        }
        
        // Start drawing HTML
        if ((counter % 2) === 0) {
            newTableRow = $('<tr>');
            newTableRow.html("<td>" + value.key + "</td>" + "<td>" + value.value + "</td>");
        }
        else {
            var temp = "<td>" + value.key + "</td>" + "<td>" + value.value + "</td>";
            newTableRow.append(temp);
            $("#tab").append(newTableRow);
            newTableRow = "";
        }
        counter++;
    });
    if (newTableRow !== "") {
        $("#tab").append(newTableRow);
    }
}
