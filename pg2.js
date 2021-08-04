      //Global Variable
      var csvData; // csv data
      var plotdata; //this will hold chart data at any point of time
      var topJobsData = [];
      var totaljobs;
      var topjobsKeys = []; // Top job Keys
      var origin;
      var originby = 'Application Type';  //default
      var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      };
      var width = 800;
      var height = 500;
      var xwidth = width - 2 * margin.right - 2 * margin.left;
      var yheight = height - 2 * margin.top - 2 * margin.bottom;
      const addfactor = 10;

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

      //Array value sum function
      Array.prototype.sum = function (prop) {
        var total = 0;
        for (var i = 0, _len = this.length; i < _len; i++) {
          total += this[i][prop];
        }
        return total;
      }

      // Function to check if key exists in array
      function keyExists(keyval) {
        return topjobsKeys.some(function(el) {
        return el === keyval;
      }); 
}      

      //Function to Load jobs list
      function launchJobs() {
        var selectedData = d3
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

        totaljobs = selectedData.sum("value"); // getting total jobs

        selectedData.sort(function (a, b) {
          return d3.descending(+a.value, +b.value);
        });
        topJobsData = selectedData.slice(0, 20); // Top 20 elements
        topjobsKeys = topJobsData.map(d => {return d.key;}); //Storing top job titles
        // console.log('topjobsKeys', topjobsKeys);

        // Commented section to add other jobs and number
        var remainingJobdata = selectedData.slice(20); // remaining after 20 elements
        // console.log(remainingJobdata.sum("value"));
        var newElement = [{ key: "All Other Jobs", value: remainingJobdata.sum("value") }];
        topJobsData = topJobsData.concat(newElement); // added others as the first element
        newElement = [{ key: "All Jobs", value: totaljobs }];
        topJobsData = topJobsData.concat(newElement); // added others as the first element        
        // console.log(topJobsData);

        //Now load data to the select
        // ***** adding jobs select ******
        var jobtitlelbl = document.createElement("label");
        jobtitlelbl.innerHTML =
          "Job Title: " + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        jobtitlelbl.htmlFor = "jobs";

        var selectedjobtitle = document.createElement("select");
        selectedjobtitle.name = "jobtitle";
        selectedjobtitle.id = "jobtitle";
        selectedjobtitle.addEventListener("change", function (event) {
          origin = document.getElementById("jobtitle").value;
          initializeChartData();
          displayChart();
        });

        

        for (const val of topJobsData) {
          jobtitleoption = document.createElement("option");
          jobtitleoption.value = val.key;
          jobtitleoption.text = val.key + " : " + val.value;
          if (val.key == origin) jobtitleoption.selected = true;
          selectedjobtitle.appendChild(jobtitleoption);
        }

        //First remove all elements and then add
        document.getElementById("selectdiv").innerHTML = null;
        document
          .getElementById("selectdiv")
          .appendChild(jobtitlelbl)
          .appendChild(selectedjobtitle);
        
        var brelement = document.createElement("p");
        document
          .getElementById("selectdiv")
          .appendChild(brelement); 

        // ***** adding by select ******
        var bylabel = document.createElement("label");
        bylabel.innerHTML =
          "Employer Type : ";
          bylabel.htmlFor = "by"; 

        var selectby = document.createElement("select");
        selectby.name = "by";
        selectby.id = "by";
        selectby.addEventListener("change", function (event) {
          originby = document.getElementById("by").value;
          //Show chart
          initializePlotData();
          displayChart();
        });
 
              
        var appType = document.createElement("option");
        appType.value = 'Application Type';
        appType.text = 'Application Type';
        selectby.appendChild(appType); 
		var industryOption = document.createElement("option");
        industryOption.value = 'Industry';
        industryOption.text = 'Industry';
        selectby.appendChild(industryOption); 
		var ownershipByOption = document.createElement("option");
        ownershipByOption.value = 'Type of Ownership';
        ownershipByOption.text = 'Type of Ownership';
        selectby.appendChild(ownershipByOption);        
        
        //First remove all elements and then add
        document.getElementById("bydiv").innerHTML = null;
        document
          .getElementById("bydiv")
          .appendChild(bylabel)
          .appendChild(selectby);
      }

      function launchPage(id) {
        //replace space and & character for url 
        var originwsa = origin.replace('+','`').replace(' & ','~').replace(' ', '^');
        var originbywsa = originby.replace('+','`').replace(' & ','~').replace(' ', '^');
        var originbyvalwsa = id.replace('+','`').replace(' & ','~').replace(' ', '^');
        dest = "pg3.html" + "?origin=" + originwsa + "&originby=" + originbywsa + "&originbyval=" + originbyvalwsa;
        //console.log(dest);
        window.location = dest;
      }

      //Function called on body onload
      async function initialize() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        origin =
          urlParams.get("origin") == undefined ||
          urlParams.get("origin") == null ||
          urlParams.get("origin") == ""
            ? "All Jobs"
            : urlParams.get("origin");
        // console.log(origin);

        data = await d3.csv("data/IndianGovtJobs.csv");

        launchJobs();
        initializePlotData();
        //Show chart
        displayChart();
      }

      //Function to form chart data depending on selection
      function initializePlotData() {
        var keyval;
        //Form data per origin by
        if (originby === 'Industry') {
           plotdata = d3
          .nest()
          .key(function (d) {
			console.log("d.Industry::"+d.Industry);
            if (d.Industry == "") keyval = "Unknown";
            else if (d.Industry == "-1") keyval = "Unknown";
            else keyval = d.Industry;
            if (origin == "All Jobs") return keyval;
            else if (origin == "All Other Jobs") {
              if (keyExists(d.JobTitle)) return "Filter";
              else return keyval;
            }             
            else if (d.JobTitle == origin) return keyval;
            else return "Filter";
          })
          .rollup(function (d) {
            return d3.sum(d, function (g) {
              return 1;
            });
          })
          .entries(data);
        } else if (originby === 'Application Type') {
          plotdata = d3
          .nest()
          .key(function (d) {
            if (d.ApplicationType == "") keyval = "Unknown";
            else if (d.ApplicationType == "-1") keyval = "Unknown";
            //else if (d.Revenue == "Unknown / Non-Applicable") keyval = "Unknown";
            else keyval = d.ApplicationType;
            if (origin == "All Jobs") return keyval;
            else if (origin == "All Other Jobs") {
              if (keyExists(d.JobTitle)) return "Filter";
              else return keyval;
            }               
            else if (d.JobTitle == origin) return keyval;
            else return "Filter";
          })
          .rollup(function (d) {
            return d3.sum(d, function (g) {
              return 1;
            });
          })
          .entries(data);
        } else if (originby === 'Type of Ownership') {
          plotdata = d3
          .nest()
          .key(function (d) {
            if (d.TypeOfOwnership == "") keyval = "Unknown";
            else if (d.TypeOfOwnership == "-1") keyval = "Unknown";
            else keyval = d.TypeOfOwnership;
            if (origin == "All Jobs") return keyval;
            else if (origin == "All Other Jobs") {
              if (keyExists(d.JobTitle)) return "Filter";
              else return keyval;
            }           
            else if (d.JobTitle == origin) return keyval;
            else return "Filter";
          })
          .rollup(function (d) {
            return d3.sum(d, function (g) {
              return 1;
            });
          })
          .entries(data);
        } 
                
      }      

      //Function to draw chart
      function displayChart() {
        var data2 = [];
        var toodata;
        plotdata.sort(function (a, b) {
		  console.log("a.value:"+a.value+" and b.value:"+b.value);
          return d3.descending(+a.value, +b.value);
        });

        //Removing "Filter" record - as it is for other than the passed origin
        var data2 = plotdata.filter((x) => {
          return x.key != "Filter";
        });

        if(origin == 'All Other Jobs') {
          toodata = data2;
        } else {
          toodata = data2.slice(0, 20); // Top 20 elements
        }
        // console.log('toodata', toodata);     

        //X-scale
        var xs = d3
          .scaleBand()
          .domain(
            toodata.map(function (d) {
              return d.key;
            })
          )
          .range([0, xwidth]);

        //y-scale
        var ys = d3
          .scaleLinear()
          .domain([
            d3.min(toodata, function (d) {
              return d.value;
            }),
            d3.max(toodata, function (d) {
              return d.value;
            }),
          ])
          .range([yheight, 0]);

        var colorrn = d3.scaleOrdinal(d3.schemeCategory10); 

        // Tool Tip mouse hover
        var tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("z-index", 10)
          .style("visibility", "hidden")
          .text("Simple text");

        //Before drawing chart set everything to blank
        document.getElementById("chartlabel").innerHTML = "<mark class='green'> Chart: </mark>" + 
          "Job Title distribution <mark class='teal'>" + origin + "</mark> by top 20 in category type type (<mark class='teal'>" + originby + "</mark>)" + " by number of open positions";

        d3.select("svg").selectAll("*").remove();

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
          .data(toodata)
          .enter()
          .append("rect")
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
            var selobject = jobsData.find(a => a.key == origin);
            var textval = selobject.key + " : " + selobject.value;
            textval = textval + "</br>" + d.key + " : " + d.value.toFixed(0) + ' Jobs';
            tooltip.html(textval);
            return tooltip.style("visibility", "visible");
          })
          .on("mousemove", function () {
            return tooltip
              .style("top", d3.event.pageY - 10 + "px")
              .style("left", d3.event.pageX + 10 + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"))
          .on("click", (d) => {
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
              .tickValues([0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200])
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
          .style("font-size", "11px")
          .style("font-weight", "bold");
      }