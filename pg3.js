//Global Variable
      var filedata; // this one holds csv data
      var filteredData = []; // holds filtered data per parameters
      var chartdata = []; //this will hold chart data at any point of time
      var totaljobs;
      var topjobs = []; // Top job Keys
      var origin;
      var originby = 'Company Name';  //default
      var originByVal;

      // Scene navigation logic
      var currentPage1 = "pg3.html";
      var nxtPg1 = "pg3.html";
      var prevPg1 = "pg2.html";
      var dashboardpg1 = "pg1.html";
      var categoryPage1 = "pg2.html";
      var catdetailPage1 = "pg3.html";

      function navigate(action) {
        if (action == "next") {
          dest = nxtPg1;
        } else if (action == "back") {
          dest = prevPg1;
        } else if (action == "dashboard") {
          dest = dashboardpg1;
        } else if (action == "category") {
          dest = categoryPage1;
        } else if (action == "categoryDetail") {
          dest = catdetailPage1;
        } else dest = "#";
        window.location = dest;
      }

      // global JavaScript variables
      var list = [];
      var pgList = [];
      var currPage = 1;
      var numberPerPage = 6;
      var numOfPgs = 1;   // total number of pages      

      function nextPage() {
        currPage += 1;
        d3.select("svg").selectAll("*").remove(); 
        setTimeout(function(){ populateList(); }, 500);
      }

      function previousPage() {
        currPage -= 1;
        d3.select("svg").selectAll("*").remove(); 
        setTimeout(function(){ populateList(); }, 500);
      }

      function firstPage() {
        currPage = 1;
        d3.select("svg").selectAll("*").remove(); 
        setTimeout(function(){ populateList(); }, 500);
      }

      function lastPage() {
        currPage = numOfPgs;
        d3.select("svg").selectAll("*").remove(); 
        setTimeout(function(){ populateList(); }, 500);
      }

      function getNumberOfPages() {
        return Math.ceil(list.length / numberPerPage);
      }      

      function populateList() {
        numOfPgs = getNumberOfPages();
        var start = ((currPage - 1) * numberPerPage);
        var stop = start + numberPerPage;

        pgList = list.slice(start, stop);
        drawChart(pgList); // draws out our data
        check();         // determines the states of the pagination buttons

        //set page number
        document.getElementById("paginationlabel").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
        "Total Companies: <b>" + list.length + "</b>" + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
          "Current Page: <b>" + currPage + "</b>" + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + "Total Pages:<b>" + numOfPgs + "</b>";    
      } 
      
      function check() {
        document.getElementById("next").disabled = currPage == numOfPgs ? true : false;
        document.getElementById("previous").disabled = currPage == 1 ? true : false;
        document.getElementById("first").disabled = currPage == 1 ? true : false;
        document.getElementById("last").disabled = currPage == numOfPgs ? true : false;
      }      

      // All chart variables
      var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // The scale spacing the groups:
      var x0 = d3.scaleBand()
          .rangeRound([0, width])
          .paddingInner(0.1);

      // The scale for spacing each group's bar:
      var x1 = d3.scaleBand()
          .padding(0.05);

      var y = d3.scaleLinear()
        .rangeRound([height, 0]);   
        
      var z = d3.scaleOrdinal()
        //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);        
        .range(["steelblue", "darkorange", "green", "red", "purple", "brown", "pink"]);

      // Tool Tip mouse hover
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", 10)
        .style("visibility", "hidden")
        .text("Simple text");

      //Function called on body onload
      async function initialize() {
        filedata = await d3.csv("data/IndianGovtJobs.csv");

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        origin =
          urlParams.get("origin") == undefined ||
          urlParams.get("origin") == null ||
          urlParams.get("origin") == ""
            ? "All Jobs"
            : urlParams.get("origin").replace('^', ' ').replace('~',' & ').replace('`', '+');
        originby =
          urlParams.get("originby") == undefined ||
          urlParams.get("originby") == null ||
          urlParams.get("originby") == ""
            ? "Application Type"
            : urlParams.get("originby").replace('^', ' ').replace('~',' & ').replace('`', '+');
        originbyval =
          urlParams.get("originbyval") == undefined ||
          urlParams.get("originbyval") == null ||
          urlParams.get("originbyval") == ""
            ? ""
            : urlParams.get("originbyval").replace('^', ' ').replace('~',' & ').replace('`', '+');            
        console.log('origin', origin);
        console.log('originby', originby);
        console.log('originbyval', originbyval);

        //Before drawing chart set everything to blank
        var originbyval1 = (originbyval !== "")? originbyval : "All";
        document.getElementById("chartlabel").innerHTML = "<mark class='green'> Chart: </mark>" + 
          "Showing distribution for <mark class='teal'>" + origin + "</mark> by Employer " + 
          "<mark class='teal'>" + originby + "</mark> - " + "<mark class='green'>" + originbyval1 + "</mark>." +
          " Starting with Companies having more number of jobs." + "</br></br>";

        initializeChartData(); //initializes list with data for the next populateList call
        populateList();
      }


      //Function to form chart data depending on selection
      function initializeChartData() {
        var keyval;
        
        // first filter data by origin type
        if (originby === 'Nature of Ownership') {
          if (originbyval === '') {
            filteredData = filedata.filter(function(d){return d;});
          } else if (originbyval === 'Unknown') {
            filteredData = filedata.filter(function(d){
              if ((d.NatureOfOwnership == '-1') || (d.NatureOfOwnership.toLowerCase().indexOf('unknown') !== -1)) 
              return d ;
            });
          } else {
            filteredData = filedata.filter(function(d){return d.NatureOfOwnership == originbyval;});
          }
        } 
        else if (originby === 'Industry') {
          if (originbyval === '') {
            filteredData = filedata.filter(function(d){return d;});
          } else if (originbyval === 'Unknown') {
            filteredData = filedata.filter(function(d){
              if ((d.Industry == '-1') || (d.Industry.toLowerCase().indexOf('unknown') !== -1)) 
              return d ;
            });
          } else {
            filteredData = filedata.filter(function(d){return d.Industry == originbyval;});
          }
        }
        else if (originby === 'Application Type') {
          if (originbyval === '') {
            filteredData = filedata.filter(function(d){return d;});
          } else if (originbyval === 'Unknown') {
            filteredData = filedata.filter(function(d){
              if ((d.ApplicationType == '-1') || (d.ApplicationType.toLowerCase().indexOf('unknown') !== -1)) 
              return d ;
            });
          } else {
            filteredData = filedata.filter(function(d){return d.ApplicationType == originbyval;});
          }
        } 
        //console.log('filteredData', filteredData);

        // form chart data now
        var interimData, interimData1, interimData2, interimData3  = [];
        interimData = d3
        .nest()
        .key(function (d) {
          if (d["OrganisationName"] === "") keyval = "NA";
          else if (d["OrganisationName"] === "-1") keyval = "NA";
          else keyval = d["OrganisationName"].split('\n')[0]; //Removing linefeed and numbers at the end of company name
          return keyval;
        })      
        .rollup(function (d) {
          return {
            fixed_term_engineer: d3.sum(d, function (g) {
              if (g.JobTitle.toLowerCase() == 'fixed term engineer') return 1;
              else return 0;
            }),
            field_engineer: d3.sum(d, function (g) {
              if (g.JobTitle.toLowerCase() == 'field engineer') return 1;
              else return 0;
            }),
            project_engineer: d3.sum(d, function (g) {
              if (g.JobTitle.toLowerCase() == 'project engineer') return 1;
              else return 0;
            }),
            project_associate: d3.sum(d, function (g) {
              if (g.JobTitle.toLowerCase() == 'project associate') return 1;
              else return 0;
            }),
            assistant_engineer: d3.sum(d, function (g) {
              if (g.JobTitle.toLowerCase() == 'assistant engineer') return 1;
              else return 0;
            }),
            others: d3.sum(d, function (g) {
              if ((g.JobTitle.toLowerCase() != 'fixed term engineer') &&
              (g.JobTitle.toLowerCase() != 'field engineer') &&
              (g.JobTitle.toLowerCase() != 'project engineer') &&
              (g.JobTitle.toLowerCase() != 'project associate') &&
              (g.JobTitle.toLowerCase() != 'assistant engineer')) {
                return 1;
              }
              else return 0;
            }),
            totaljobcount: d3.sum(d, function (g) {
                return 1;
            })
          }
        })
        .entries(filteredData);

        if((origin !== 'All Jobs') && (origin !== ""))
          if (origin == 'Fixed Term Engineer') interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.fixed_term_engineer, b.value.fixed_term_engineer));
          else if (origin == 'Field Engineer') interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.field_engineer, b.value.field_engineer));
          else if (origin == 'Project Engineer') interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.project_engineer, b.value.project_engineer));
          else if (origin == 'Project Associate') interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.project_associate, b.value.project_associate));
          else if (origin == 'Assistant Engineer') interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.assistant_engineer, b.value.assistant_engineer)); 
          else interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.totaljobcount, b.value.totaljobcount));         
        else
          interimData1 = interimData.slice().sort((a, b) => d3.descending(a.value.totaljobcount, b.value.totaljobcount));

        var i = 0;   
        interimData2 = interimData1.map(function (obj) {
          return {
            key: obj.key,
            fixed_term_engineer: obj.value.fixed_term_engineer,
            field_engineer: obj.value.field_engineer,
            project_engineer: obj.value.project_engineer ,
            project_associate: obj.value.project_associate,
            assistant_engineer: obj.value.assistant_engineer,
            others: obj.value.others,
            totaljobcount: obj.value.totaljobcount
          }
        });
        // console.log('Sorted Data', interimData2);
        list = [...interimData2];
      }      

      //Drawing the chart
      function drawChart(data) {
        //data = data.slice(0, 8);
        console.log('Page Data', data);

        svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");        

        x0 = d3.scaleBand()
          .rangeRound([0, width])
          .paddingInner(0.1);

        // The scale for spacing each group's bar:
        x1 = d3.scaleBand()
          .padding(0.05);

        y = d3.scaleLinear()
        .rangeRound([height, 0]);   

        z = d3.scaleOrdinal()
        //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);        
        .range(["steelblue", "darkorange", "green", "red", "purple", "brown", "pink"]);        

        //var keys = data.columns.slice(1);
        //var keys = ['fixed_term_engineer' ,'field_engineer', 'project_engineer', 'project_associate', 'assistant_engineer', 'others', 'totaljobcount'];
        var keys = ['fixed_term_engineer' ,'field_engineer', 'project_engineer', 'project_associate', 'assistant_engineer', 'others'];

        // console.log('keys', keys);
        x0.domain(data.map(function(d) { return d.key; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class","bar")
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function(d) { return z(d.key); })
          .on("mouseover", function(d,i) {
            var selval = pgList[i];
            var textval = "";
            // textval = textval + "Company Name : " + selval.key;
            // textval = textval + "</br>" + originby ;
            // if (originbyval !== "") textval = textval + " : " + originbyval;
            // else textval = textval + " : " + "All";
            // textval = textval + "</br>" + "Total Jobs : " + selval.totaljobcount;
            // textval = textval + "</br>" + d.key + " : " +  d.value
            textval = d.key + " : " +  d.value
            tooltip.html(textval);
            return tooltip.style("visibility", "visible");
          })    
          .on("mousemove", function () {
            return tooltip
              .style("top", d3.event.pageY - 10 + "px")
              .style("left", d3.event.pageX + 10 + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"));            

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .style("font-size", "12px");

        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("font-size", 11)
            .attr("fill", "#000")
            //.attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("No. Of Jobs");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 17)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z)
            .attr("stroke", z)
            .attr("stroke-width",2)
            .on("click",function(d) { update(d) });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });

        var filtered = [];

        function update(d) {

          // Array update and clicked key addition if not included
            if (filtered.indexOf(d) == -1) {
                filtered.push(d);
                // if all bars are un-checked, reset:
                if(filtered.length == keys.length) filtered = [];
            }
            else {             // remove
                filtered.splice(filtered.indexOf(d), 1);
            }

            // Scale update group items
            var newKeys = [];
            keys.forEach(function(d) {
                if (filtered.indexOf(d) == -1 ) {
                    newKeys.push(d);
                }
            })
            x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

            // update y axis:
            svg.select(".y")
                .transition()
                .call(d3.axisLeft(y).ticks(null, "s"))
                .duration(500);

            //Hide bands if required
            var bars = svg.selectAll(".bar").selectAll("rect")
                .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

            bars.filter(function(d) {
                    return filtered.indexOf(d.key) > -1;
                })
                .transition()
                .attr("x", function(d) {
                    return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;
                })
                .attr("height",0)
                .attr("width",0)
                .attr("y", function(d) { return height; })
                .duration(500);

            // Bars adjustment
            bars.filter(function(d) {
                    return filtered.indexOf(d.key) == -1;
                })
                .transition()
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("fill", function(d) { return z(d.key); })
                .duration(500);


            // update filters
            legend.selectAll("rect")
                .transition()
                .attr("fill",function(d) {
                    if (filtered.length) {
                        if (filtered.indexOf(d) == -1) {
                            return z(d);
                        }
                        else {
                            return "white";
                        }
                    }
                    else {
                        return z(d);
                    }
                })
                .duration(100);
        }
      }