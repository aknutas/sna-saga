//Listeners
$(document).ready(onStart());

//Globs
var Network = [];
var centralityArray = [];

//Hardcoded conf values, bad (but it works)
var minNodeSize = 5;
var maxNodeSize = 20;
var nszDiff = maxNodeSize - minNodeSize;

var maxNodeWeight = null;
var minNodeWeight = null;

function Edge(id, target, weight) {
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
        var newNode = new Edge(value.source, value.target, value.weight);
        Network.push(newNode);
    });
    //Calculate centralities
	//Takes Network as a parameter and stores the results in centralityArray
    goCalc(Network, centralityArray);
    //Draw graph based on network and centralityarray
    drawNewStyleGraph(Network, centralityArray);
}

function drawNewStyleGraph(network, centralities) {
	var width = 1024,
	height = 768;

	var color = d3.scale.category20();

	var force = d3.layout.force()
	.charge(-500)
	.linkDistance(100)
	.size([width, height]);

	var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	var nodes = [],
	indexednodes = [],
	links = [];
	
	$.each(centralities, function(index, value){
		//TODO: Adjustable filtering
		//Checking to exclude from network
		var toSkip = true;
		network.forEach(function(link){
			//TODO: Adjustable filtering
			if((link.id === index || link.target === index) && link.weight > 1){
				toSkip = false;
			}
		});
		if(!toSkip){
			//Adding new node to network (if passed filtering)
			console.log("Added new node " + index + " weight: " + value);
			var newnode = {"id" : index, "label" : index, "rweight" : value, "group" : 1};
			nodes.push(newnode);
			indexednodes[index] = newnode;
		}
	});
	
	network.forEach(function(link){
		//TODO: Adjustable filtering
		if(indexednodes[link.id] != null && indexednodes[link.target] != null && link.weight > 1){
			var s = indexednodes[link.id],
			t = indexednodes[link.target];
			links.push({source: s, target: t});
		}
	});

	force
	.nodes(nodes)
	.links(links)
	.start();

	var link = svg.selectAll(".link")
	.data(links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.value); });
	
	// Create the groups under svg
	var gnodes = svg.selectAll('g.gnode')
	.data(nodes)
	.enter()
	.append('g')
	.classed('gnode', true);

	var node = gnodes.append("circle")
	.attr("class", "node")
	.attr("r", function(d) { return ((((d.rweight-minNodeWeight)/(maxNodeWeight-minNodeWeight))*nszDiff)+minNodeSize); })
	.style("fill", function(d) { return color(d.group); })
	.call(force.drag);
	
	var labels = gnodes.append("text")
	.attr("text-anchor", "middle")
	.text(function(d) { return d.label; });

	force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

			gnodes.attr("transform", function(d) { 
			        return 'translate(' + [d.x, d.y] + ')'; 
			    });
	  });
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
        
        // Start drawing the HTML table
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
