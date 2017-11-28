const d3 = require('d3');

// pres chart
{

  const timeFrame = [1732, 1790]
  const svg = d3.select('#presidents svg');

  svg.attr('width', window.innerWidth);
  svg.attr('height', window.innerHeight / 2);

  const margin = {top: 20, right: 0, bottom: 40, left: 300},
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

    let curData = data;

    const xAxis = d3.axisBottom(x).ticks(5);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + height + ')')
      .call(xAxis);

    g.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

//UPDATE FUNCTION
    const updateChart = (data) => {
      const t = d3.transition()
        .duration(250);

      // const min = d3.min(data, function(d) { return d.yearsAlive[0]; });
      const min = timeFrame[0];
      const max = timeFrame[1];


      x.domain([min, max]);
      y.domain(data.map(function(d) { return d.president; }));

      g.select('.x')
        // .transition(t)
          .call(xAxis);

// Years alive

{
      const yearsAliveBars = g.selectAll('.years-alive')
        .data(data);

      yearsAliveBars.exit()
        .remove();


      yearsAliveBars//.transition(t)
        .attr('x', function(d) { return x(d.yearsAlive[0])})
        .attr('y', function(d) { return y(d.president); })
        .attr('width', function(d) { return x(d.numYearsAlive + min)})
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
        .data(data);

      yearsPresBars.exit()
        .remove();


      yearsPresBars//.transition(t)
        .attr('x', function(d) { return x(d.yearsAsPres[0])})
        .attr('y', function(d) { return y(d.president); })
        .attr('width', function(d) { return x(d.numYearsAsPres + min)})
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
      .data(data);

    presNames.exit()
      .remove();

    presNames
      .attr('x', function(d) { return x(d.yearsAlive[0])})
      .attr('y', function(d) { return y(d.president) + 20; })
      .attr('width', function(d) { return x(d.numYearsAlive + min)})
      .attr('height', y.bandwidth());

    presNames.enter()
      .append('text')
      .attr('class', 'pres-names')
      .attr('x', function(d) { return x(d.yearsAsPres[0])})
      .attr('height', y.bandwidth())
      .attr('y', function(d) { return y(d.president) + 20; })
      .text(function(d) { return d.president })
      .merge(presNames);

}

    }

    updateChart(curData);

    const narrowTimeFrame = (start, end) => {
      curData = data.filter((pres) => {
        if((pres.yearsAlive[1] > start) && pres.yearsAlive[0] < end) {
          if(pres.yearsAlive[0] < start) {
            pres.yearsAlive[0] = start;
            pres.numYearsAlive = pres.yearsAlive[1] - pres.yearsAlive[0];
          }
          if(pres.yearsAsPres[0] < start) {
            pres.yearsAsPres[0] = start;
            pres.numYearsAsPres = pres.yearsAsPres[1] - pres.yearsAsPres[0];
          }
          return pres;
        }
      });

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
  }, false)

  });

}
