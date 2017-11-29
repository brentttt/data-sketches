const d3 = require('d3');

Array.prototype.clone = function(){
  return JSON.parse(JSON.stringify(this))
};

// pres chart
{

  const timeFrame = [1732, 1790]
  const svg = d3.select('#presidents svg');

  svg.attr('width', window.innerWidth);
  svg.attr('height', window.innerHeight);

  const margin = {top: 20, right: 0, bottom: 150, left: 300},
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.json('./data/pres.json', (err, data) => {
    if(err) throw err;

    data.reverse();

    data.map((pres) => {
      pres.numYearsAlive = pres.yearsAlive[1] - pres.yearsAlive[0];
      pres.numYearsAsPres = pres.yearsAsPres[1] - pres.yearsAsPres[0];
      return pres;
    });

    var x = d3.scaleLinear()
        .range([0,width]);

    var y = d3.scaleBand()
        .range([height, 0]);

    let curData = data.clone();

    const xAxis = d3.axisBottom(x).ticks(5);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + height + ')')
      .call(xAxis);

    g.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

//UPDATE FUNCTION
    const updateChart = (newData) => {
      const t = d3.transition()
        .duration(50);

      // const min = d3.min(data, function(d) { return d.yearsAlive[0]; });
      const min = timeFrame[0];
      const max = timeFrame[1];


      x.domain([min, max]);
      y.domain(newData.map(function(d) { return d.president; }));

      g.select('.x')
        // .transition(t)
          .call(xAxis);

// Years alive

{
      const yearsAliveBars = g.selectAll('.years-alive')
        .data(newData);

      yearsAliveBars.exit()
      .transition(t)
        .attr('height', 0)
        .remove();

        let grover = false;

      yearsAliveBars//.transition(t)
        .attr('x', function(d) { return x(d.yearsAlive[0])})
        .attr('width', function(d) {
          if(d.president !== 'Grover Cleveland') {
            return x(d.numYearsAlive + min)
          }
          if(d.president === 'Grover Cleveland' && !grover) {
            grover = true;
            return x(d.numYearsAlive + min)
          }
          }
        )
        .transition(t)
        .attr('y', function(d) { return y(d.president); })
        .attr('height', y.bandwidth());


      yearsAliveBars.enter()
        .append('rect')
        .attr('class', 'bar years-alive')
        .attr('x', function(d) { return x(d.yearsAlive[0])})
        .attr('height', y.bandwidth())
        .attr('y', function(d) { return y(d.president); })
        .attr('width', function(d) { return x(d.numYearsAlive + min)})
      .merge(yearsAliveBars);
}

// Years pres

{
      const yearsPresBars = g.selectAll('.years-pres')
        .data(newData);

      yearsPresBars.exit()
        .remove();


      yearsPresBars//.transition(t)
        .attr('x', function(d) { return x(d.yearsAsPres[0])})
        .attr('width', function(d) { return x(d.numYearsAsPres + min)})
        .transition(t)
        .attr('y', function(d) { return y(d.president); })
        .attr('height', y.bandwidth());


      yearsPresBars.enter()
        .append('rect')
        .attr('class', 'bar years-pres')
        .attr('x', function(d) { return x(d.yearsAsPres[0])})
        .attr('height', y.bandwidth())
        .attr('y', function(d) { return y(d.president); })
        .attr('width', function(d) { return x(d.numYearsAsPres + min)})
        // .text((d) => {d.president})
      .merge(yearsPresBars);
}
{
// NAMES
    const presNames = g.selectAll('.pres-names')
      .data(newData);

    presNames.exit()
      // .transition(t)
      // .style('opacity', '0')
      .remove();

    presNames
      .attr('x', function(d) { return x(d.yearsAlive[0])})
      .attr('width', function(d) { return x(d.numYearsAlive + min)})
      .attr('height', y.bandwidth())
      .text(function(d) { return d.president })
      .transition(t)
      .attr('y', function(d) { return y(d.president) + 10; });

    presNames.enter()
      .append('text')
      .merge(presNames)
      .attr('class', 'pres-names')
      .attr('x', function(d) { return x(d.yearsAlive[0])})
      .attr('height', y.bandwidth())
      .text(function(d) { return d.president })
      .transition(t)
      .attr('y', function(d) { return y(d.president) + 10; });

}

    }

    const narrowTimeFrame = (start, end) => {
      let clone = data.clone();
      clone = clone.map((pres) => {

        // clip beggining
          if(pres.yearsAlive[0] < start) {
            pres.yearsAlive[0] = start;
            pres.numYearsAlive = pres.yearsAlive[1] - pres.yearsAlive[0];
          }
          if(pres.yearsAsPres[0] < start) {
            pres.yearsAsPres[0] = start;
            pres.numYearsAsPres = pres.yearsAsPres[1] - pres.yearsAsPres[0];

            if(pres.numYearsAsPres <= 0) pres.numYearsAsPres = 0;
          }
          // clip ending

          if(pres.yearsAlive[0] > end) {
            pres.numYearsAlive = 0
          }

          return pres;
      });

      clone = clone.filter((pres) => {
        if(pres.numYearsAlive > 0) {
             return pres;
        }
      })

      curData = clone;


    }

    let lastScrollPos = 0;

    document.addEventListener('scroll', (e) => {
      var st = window.pageYOffset || document.documentElement.scrollPos;
      if (st > lastScrollPos){
        timeFrame[0] = timeFrame[0] + .4;
        timeFrame[1] = timeFrame[1] + .4;
      } else {
        timeFrame[0] = timeFrame[0] - .4;
        timeFrame[1] = timeFrame[1] - .4;
      }
      lastScrollPos = st;

      narrowTimeFrame(timeFrame[0], timeFrame[1]);
      updateChart(curData);
    }, false);

    updateChart(curData);

  });

}
