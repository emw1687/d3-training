function buildChart(containerId) {
    // size globals
    var width = 1200;
    var height = 700;

    var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 100
    };

    // calculate dimensions without margins
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    // create svg element
    var svg = d3
        .select(containerId)
        .append('svg')
        .attr('height', height)
        .attr('width', width);

    // create inner group element
    var g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // read in our data
    d3.csv('air_quality.csv', function(error, data) {
        // handle read errors
        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw', data);

        // coerce data to numeric
        data.forEach(function(d) {
            d.Emissions = +d.Emissions;
        });

        console.log('clean', data);

        // scales
        var x = d3
            .scaleBand()
            .domain(
                data.map(function(d) {
                    return d.State;
                })
            )
            .range([0, innerWidth])
            .padding(0.2);

        console.log(x.domain(), x.range());

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(data, function(d) {
                    return d.Emissions;
                })
            ])
            .range([innerHeight, 0]);

        console.log(y.domain(), y.range());

        // axes
        var xAxis = d3.axisBottom(x);

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);

        var yAxis = d3.axisLeft(y).ticks(15);

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // bars
        g
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) {
                return x(d.State);
            })
            .attr('y', function(d) {
                return y(d.Emissions);
            })
            .attr('width', x.bandwidth())
            .attr('height', function(d) {
                return innerHeight - y(d.Emissions);
            })
            .attr("fill", function(d) {
                if (d.Region == 'South') {
                  return "red";
                } else if (d.Region == 'Northeast') {
                  return "blue";
                } else if (d.Region == "West") {
                  return "yellow";
                } else if (d.Region == "Midwest") {
                    return "green";
                }
              })
            .attr('stroke', 'none');

        // axis labels
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('State');

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', -50)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-50,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Emissions');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Emissions by State');

    d3.selectAll("input").on("change", sortBars);
        
        function sortBars() {

            if (this.checked) {

            var inputValue = this.value;

            var dataCopy = data.map(function(d) {return Object.assign({}, d); });
            
            if (inputValue === "sortStates") {
                var sort = function(a, z) {return d3.ascending(z.State, a.State); }
            }
            else if (inputValue === "emissionsHigh") {
                var sort = function(a, z) {return d3.descending(z.Emissions, a.Emissions); }
            } else {var sort = function(a, z) {return d3.descending(a.Emissions, z.Emissions); }
                }

            dataCopy.sort(sort);
            x.domain(dataCopy.map(function(d) {return d.State; }));

           var delayInterval = d3.select('#userDelay').node().value

           if (isNaN(delayInterval)) {
            alert('this is not a number')
            return;
           }

            // Add delayInterval as a parameter
            var delay = function(d, i) {
                return i*delayInterval
            }

            g
                .selectAll('.bar')
                .sort(sort)
                .data(dataCopy)
                .transition()
                .duration(1500)
                .delay(delay)
                .attr('x', function(d) {
                    return x(d.State);
                });

        var xAxis = d3.axisBottom(x);

            g
                .select('.x-axis').transition()
                .duration(1500)
                .call(xAxis)
                .selectAll('g')
                .delay(delay);
        }
    }
    });
}

buildChart('#chart-holder');