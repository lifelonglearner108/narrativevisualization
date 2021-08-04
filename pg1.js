var currPg = "pg1.html";
      var nxtPg = "pg2.html";
      var prevPg = "pg1.html";
      var dashboardPage = "pg1.html";
      var categoryPage = "pg2.html";
      var catdetailPage = "pg3.html";

      function navigate(action) {
        if (action == "next") {
          dest = nxtPg;
        } else if (action == "back") {
          dest = prevPg;
        } else if (action == "dashboard") {
          dest = dashboardPage;
        } else if (action == "category") {
          dest = categoryPage;
        } else if (action == "categoryDetail") {
          dest = catdetailPage;
        } else dest = "#";
        window.location = dest;
      }

      async function initialize() {
        var margin = {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        };
        var width = 1000;
        var height = 500;
        var xwidth = width / 2 - 2 * margin.right - 2 * margin.left;
        var yheight = height - 2 * margin.top - 2 * margin.bottom;
        const addfactor = 10;
        const data = await d3.csv("data/IndianGovtJobs.csv");

        function launchPage(id) {
          dest = "pg2.html" + "?origin=" + id;
          console.log("dest:"+dest);
          window.location = dest;
        }

        // Donut Chart 
        var workingData = d3
          .nest()
          .key(function (d) {
            return d.JobTitle == "" ? "None" : d.JobTitle;
          })
          .rollup(function (d) {
            return d3.sum(d, function (g) {
              return 1;
            });
          })
          .entries(data);

        workingData.sort(function (a, b) {
          return d3.descending(+a.value, +b.value);
        });
        var plotData = workingData.slice(0, 20); // Top 20 elements

        //X-scale
        var xs = d3
          .scaleBand()
          .domain(
            plotData.map(function (d) {
              return d.key;
            })
          )
          .range([0, xwidth]);

        //y-scale
        var ys = d3
          .scaleLinear()
          .domain([
            d3.min(plotData, function (d) {
              return d.value;
            }),
            d3.max(plotData, function (d) {
              return d.value;
            }),
          ])
          .range([yheight, 0]);

        var colorrn = d3.scaleOrdinal(d3.schemeCategory10); //donut chart colors should match the bar chart

        // Tool Tip mouse hover
        var tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("z-index", 10)
          .style("visibility", "hidden")
          .text("Simple text");

        // Chart
        d3.select("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.right + "," + margin.bottom + ")"
          )
          .selectAll("rect")
          .data(plotData)
          .enter()
		  .append("rect")
		  .attr("data-html", "true")
          .attr("x", function (d, i) {
            return xs(d.key);
          })
          .attr("y", function (d) {
            return ys(d.value);
          })
          .attr("width", xs.bandwidth())
          .attr("height", function (d) {
            return addfactor + (yheight - ys(d.value));
          })
          .attr("fill", function (d) {
	       	return colorrn(d.value);
          })
		  .text((d) => d.value)
          .on("mouseover", (d) => {
			var textvalue = "All Jobs count: " + totaljobsCount;
			textvalue = textvalue + "</br>" + (d.key + " : " + d.value.toFixed(0) + ' Jobs');
            tooltip.html(textvalue);
            return tooltip.style("visibility", "visible");
          })
          .on("mousemove", function () {
            return tooltip
              .style("top", d3.event.pageY - 10 + "px")
              .style("left", d3.event.pageX + 10 + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"))
          .on("click", (d) => {
		     console.log("d.key:"+d.key);
            launchPage(d.key);
          });

        //y - axis
        d3.select("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr(
            "transform",
            "translate(" +
              margin.right +
              "," +
              (addfactor + margin.bottom) +
              ")"
          )
          .call(
            d3
              .axisLeft(ys)
              .tickValues([0, 50, 100, 150, 200, 250, 300])
              .tickFormat(d3.format("~s"))
          );

        // text label for the y axis
        d3.select("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.right + "," + margin.bottom + ")"
          )
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - yheight / 2)
          .attr("dy", ".75em")
          .style("text-anchor", "middle")
          .style("font", "Arial")
          .style("font-size", "11px")
          .style("font-weight", "bold")
          .text("No of Jobs");

        // x- axis
        d3.select("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr(
            "transform",
            "translate(" +
              margin.right +
              "," +
              (addfactor + yheight + margin.bottom) +
              ")"
          ) //(50,450)
          .call(d3.axisBottom(xs))
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 10)
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start")
          .style("font", "Arial")
          .style("font-size", "10px")
          .style("font-weight", "bold");

        // Bar Chart End 

		// DOnut Chart 
		var otherdataDetails = workingData.slice(20); // Rest all elements
		var otherjobsTotal = otherdataDetails.reduce((acc, d) => acc + d.value, 0);
		console.log('otherjobsTotal', otherjobsTotal );
		var plotdata1 = workingData.slice(0,21);
		plotdata1[20] = {"key":"All Other Jobs", "value":otherjobsTotal};

        var radius = 150;
        var totaljobsCount = d3.sum(plotdata1, (d) => d.value); //Total jobs count
        var donutdata = plotdata1.map(function (d) {
          var val = (d.value / totaljobsCount) * 100;
          return val;
        });
        var color = d3.schemeCategory10;
        var pie = d3.pie();
        var arc = d3.arc().innerRadius(50).outerRadius(radius);
        var arcData = pie(donutdata);
        var colorOrd = d3.scaleOrdinal(d3.schemeCategory10);

        function getPlotKey(index) {
          return plotdata1[index].key;
        }

        var g = d3
          .select("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + 550 + "," + 190 + ")")
          .selectAll("path")
          .data(arcData)
          .enter();

        g.append("path")
          .attr("d", arc)
          .attr("fill", function (d, i) {
			if(i == 20) { console.log("Here"); return "#E2E2E2";}
			else return colorOrd(i);
          })
          .text((d) => d.value)
          .on("mouseover", function (d, i) {
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", "2px");
            tooltip.text(getPlotKey(i) + " : " + d3.format(".1f")(d.value) + " %");
            return tooltip.style("visibility", "visible");
          })
          .on("mousemove", function () {
            return tooltip
              .style("top", d3.event.pageY - 10 + "px")
              .style("left", d3.event.pageX + 10 + "px");
          })
          .on("mouseout", function () {
            d3.select(this)
              .style("stroke", "white")
              .style("stroke-width", "1px");
            tooltip.style("visibility", "hidden");
          })
          .on("click", (d, i) => {
		  	//console.log("getPlotKey(i):"+getPlotKey(i));
            launchPage(getPlotKey(i));
          });

        // Arc definition for label below
        var arcLabel = d3
          .arc()
          .innerRadius(radius + 14)
          .outerRadius(radius + 40);

        //Print labels
        g.append("text")
          .attr("transform", function (d) {
            return "translate(" + arcLabel.centroid(d) + ")";
          })
          .text(function (d, i) {
            return Math.round(d.value, 0) < 2
              ? ""
              : d3.format(".1f")(d.value) + " %";
          })
          .style("fill", "#1f77b4")
          .style("font", "Arial")
          .style("font-size", "10px")
          .style("font-weight", "bold");

        //X-scale
        var xs1 = d3
          .scaleBand()
          .domain(
            graphdata1.map(function (d) {
              return;
            })
          )
          .range([0, xwidth]);
      }