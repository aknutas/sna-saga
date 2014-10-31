//Onload, execute when page fully loaded
$(document).ready(function(){
	$( "#accordion" ).accordion({
		collapsible: true,
		active: false
	});
	onStart();
});

//Globs
var Network = [];
var centralityArray = [];
var Communities = [];

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
    //Calculate centralities and communities
	//Takes Network as a parameter and stores the results in centralityArray and Community array variables
    goCalc(Network, centralityArray, Communities);
    //Draw graph based on network and centralityarray
    drawNewStyleGraph(Network, centralityArray);
}

function drawNewStyleGraph(network, centralities, communities) {
	var width = 1024,
	height = 768;

	var color = d3.scale.category20();

	var force = d3.layout.force()
	.charge(-800)
	.linkDistance(100)
	.size([width, height]);

	var svg = d3.select("#svggraph").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	var nodes = [],
	indexednodes = [],
	links = [];
	
	$.each(centralities, function(index, value){
		//Checking to exclude from network
		var toSkip = true;
		network.forEach(function(link){
			//TODO: Adjustable filtering by weight
			if((link.id === index || link.target === index) && link.weight > 0.5){
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
		//TODO: Adjustable filtering by weight
		if(indexednodes[link.id] != null && indexednodes[link.target] != null && link.weight > 0.5){
			var s = indexednodes[link.id],
			t = indexednodes[link.target];
			links.push({source: s, target: t, weight: link.weight});
		}
	});

	force
	.nodes(nodes)
	.links(links)
	.start();

	//TODO: Adjust link filtering level
	var link = svg.selectAll(".link")
	.data(links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) { if(d.weight > 1){return Math.sqrt(d.weight);}else{return 0;} });
	
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

	//Force layout
	force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

			gnodes.attr("transform", function(d) { 
			        return 'translate(' + [d.x, d.y] + ')'; 
			    });
	  });

	//Fisheye effect
	//Fisheye plugin
	var fisheye = d3.fisheye.circular()
    .radius(200)
    .distortion(2);

    svg.on("mousemove", function() {
      fisheye.focus(d3.mouse(this));

      gnodes.each(function(d) { d.fisheye = fisheye(d); });

      gnodes.selectAll("circle")
          .attr("cx", function(d) { return d.fisheye.x - d.x; })
          .attr("cy", function(d) { return d.fisheye.y - d.y; })
          .attr("r", function(d) { return d.fisheye.z * ((((d.rweight-minNodeWeight)/(maxNodeWeight-minNodeWeight))*nszDiff)+minNodeSize); });

      gnodes.selectAll("text")
          .attr("dx", function(d) { return d.fisheye.x - d.x; })
          .attr("dy", function(d) { return d.fisheye.y - d.y; });
          
      link.attr("x1", function(d) { return d.source.fisheye.x; })
          .attr("y1", function(d) { return d.source.fisheye.y; })
          .attr("x2", function(d) { return d.target.fisheye.x; })
          .attr("y2", function(d) { return d.target.fisheye.y; });
    });
}

function goCalc(calcNet, centResults, communities) {
    //Calculate centrality and other measures, and store the results into an array
    var graphData = Viva.Graph.graph();
    
    calcNet.forEach(function(node) {
        graphData.addLink(node.id, node.target);
    });

    //Community detection calculation
    communities = Viva.Graph.community().slpa(graphData, 200, 0.005);
    console.log(communities);


    //Centrality calculation
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
