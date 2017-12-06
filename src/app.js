const ScrollMagic = require('ScrollMagic');
require('animation.gsap');
require('debug.addIndicators');
const TimelineMax = require('TimelineMax');

// utils
require('./utils/clone.js');

window.onbeforeunload = function () {
  console.log('test');
  console.log(document.getElementsByTagName('body')[0]);
  document.getElementsByTagName('body')[0].scrollTo(0, 0);
  return null;
}

const controller = new ScrollMagic.Controller();

let timeFrameD = {
  start: 1725,
  end: 2030
}

 const presPin = new ScrollMagic.Scene({triggerElement: '#pres-pin', duration: 2500})
              .setPin('#presidents')
              // .setTween(timeFrameD, {start: 1970, end: 2025})
              // .addIndicators({name: 'pres'})
              .addTo(controller);

      presPin.triggerHook(.075)

  const presZoom = new ScrollMagic.Scene({triggerElement: '#pres-zoom', duration: 600})
               .setTween(timeFrameD, {start: 1730, end: 1800})
               // .addIndicators({name: 'pres-zoom'})
               .addTo(controller);

       presZoom.triggerHook(.075)

 const presPan = new ScrollMagic.Scene({triggerElement: '#pres-pan', duration: 1000})
              .setTween(timeFrameD, {start: 1975, end: 2025})
              .addIndicators({name: 'pres-pan'})
              .addTo(controller);

      presPan.triggerHook(.075)



// require('./charts/pres-chart.js');

/////////////////////////////////////////////
/////////START OF PRESIDENTS CHART///////////
/////////////////////////////////////////////

const d3 = require('d3');

// pres chart
{

  // const timeFrame = [1725, 2030];
  const svg = d3.select('#presidents svg');

  svg.attr('width', window.innerWidth);
  svg.attr('height', window.innerHeight - 200);

  const margin = {top: 0, right: 0, bottom: 50, left: 300},
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.json('./data/combined.json', (err, data) => {
    if(err) throw err;

    data.presidents.reverse();

    data.presidents.map((pres) => {
      pres.numYearsAlive = pres.yearsAlive[1] - pres.yearsAlive[0];
      pres.numYearsAsPres = pres.yearsAsPres[1] - pres.yearsAsPres[0];
      return pres;
    });

    const eras = data.eras.map((era) => {
      era.numYears = era.years[1] - era.years[0];
      return era;
    });

    var x = d3.scaleLinear()
        .range([0,width]);

    var y = d3.scaleBand()
        .range([height, 0])
        .padding(.05);

    let curData = data.presidents.clone();

    const xAxis = d3.axisBottom(x)
    .tickSize(height + 15)
    .tickFormat(d3.format("d"))
    .ticks(5);

    const gDataContainer = g.append('g')

//UPDATE FUNCTION
    const updateChart = (newData) => {
      const t = d3.transition()
        .duration(200);

      // const min = d3.min(data, function(d) { return d.yearsAlive[0]; });
      const min = timeFrameD.start;
      const max = timeFrameD.end;


      x.domain([min, max]);
      y.domain(newData.map(function(d) { return d.president; }));

      g.select('.x')
          .call(xAxis);

// eras
{
  const erasBars = gDataContainer.selectAll('.era')
    .data(eras);


  erasBars.exit()
    .remove();


  erasBars
    .attr('x', function(d) { return x(d.years[0])})
    .attr('width', function(d) { return x(d.numYears + min)})
    .attr('y', function(d) {
      if(d.height) {
        return d.height * -10;
      }
      return -10;
    })
    .attr('height', function(d) {
      if(d.height) {
        return height + -d.height * -14;
      }
      return height + 20;
    });

  erasBars.enter()
    .append('rect')
    .attr('class', 'bar era')
    .attr('x', function(d) { return x(d.years[0])})
    .attr('width', function(d) { return x(d.numYears + min)})
    .attr('y', function(d) {
      if(d.height) {
        return d.height * -10;
      }
      return -10;
    })
    .attr('height', function(d) {
      if(d.height) {
        return height + -d.height * -14;
      }
      return height + 20;
    })
  .merge(erasBars);

  const eraLines = gDataContainer.selectAll('.era-line')
    .data(eras);

  eraLines.exit()
    .remove();

  eraLines
    .attr('d', function(d) {
      const start = x(d.years[0]);
      const width = x(d.numYears + min);
      let height = -10;
      if(d.height) {
        height = d.height * -10;
      }
      return `M${start} ${height} L${start + width} ${height} L${start + width / 2} ${height} L${start + width / 2 + 20} ${height - 20}`;
    });

  eraLines.enter()
    .append('path')
    .attr('class', 'bar era-line')
    .attr('strok-width', 2)
    .attr('d', function(d) {
      const start = x(d.years[0]);
      const width = x(d.numYears + min);
      let height = -10;
      if(d.height) {
        height = d.height * -10;
      }
      return `M${start} ${height} L${start + width} ${height} L${start + width / 2} ${height} L${start + width / 2 + 20} ${height - 20}`;
    })
  .merge(eraLines);

  const eraText = gDataContainer.selectAll('.era-text')
    .data(eras);

  eraText.exit()
    .remove();

  eraText
    .attr('x', function(d) {
      const start = x(d.years[0]);
      const width = x(d.numYears + min);
      return start + width / 2;
    })
    .attr('y', function(d) {
      if(d.height) {
        return d.height * -10 - 25;
      }
      return -35;
    })
    .text(function(d) { return d.title; });

  eraText.enter()
    .append('text')
    .attr('class', 'bar era-text')
    .attr('x', function(d) {
      const start = x(d.years[0]);
      const width = x(d.numYears + min);
      return start + width / 2;
    })
    .attr('y', function(d) {
      if(d.height) {
        return d.height * -10 - 25;
      }
      return -35;
    })
    .text(function(d) { return d.title; })
  .merge(erasBars);

}

// Years alive bars


{
      const yearsAliveBars = gDataContainer.selectAll('.years-alive')
        .data(newData);

      yearsAliveBars.exit()
        .remove();

        let grover = false;

      yearsAliveBars
        .attr('x', function(d) { return x(d.yearsAlive[0])})
        .attr('class', 'bar years-alive')
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
        // .transition(t)
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

// Years pres bars

{
      const yearsPresBars = gDataContainer.selectAll('.years-pres')
        .data(newData);

      yearsPresBars.exit()
        .remove();


      yearsPresBars
        .attr('x', function(d) { return x(d.yearsAsPres[0])})
        .attr('width', function(d) { return x(d.numYearsAsPres + min)})
        // .transition(t)
        .attr('y', function(d) { return y(d.president); })
        .attr('height', y.bandwidth());


      yearsPresBars.enter()
        .append('rect')
        .attr('class', function(d) {
          return `bar years-alive ${d.party.toLowerCase()}`;
        })
        .attr('x', function(d) { return x(d.yearsAsPres[0])})
        .attr('height', y.bandwidth())
        .attr('y', function(d) { return y(d.president); })
        .attr('width', function(d) { return x(d.numYearsAsPres + min)})
        // .text((d) => {d.president})
      .merge(yearsPresBars);
}
{
// Names
    const presNames = g.selectAll('.pres-names')
      .data(newData);

    presNames.exit()
      // .transition(t)
      // .style('opacity', '0')
      .remove();

    presNames
      .attr('x', function(d) { return x(d.yearsAlive[0])})
      .attr('width', function(d) { return x(d.numYearsAlive + min)})
      // .transition(t)
      .attr('height', y.bandwidth())
      .style('font-size', function(d) {
        const fontSize = y.bandwidth();
        if(fontSize < 15 ) return fontSize + 'px';
        return '13px';
      })
      .text(function(d) { return d.president })
      .attr('y', function(d) { return y(d.president) + ((y.bandwidth() / 1.4)); });

    presNames.enter()
      .append('text')
      .merge(presNames)
      .attr('class', 'pres-names')
      .attr('x', function(d) { return x(d.yearsAlive[0]) + 15; })
      .attr('height', y.bandwidth())
      .style('font-size', function(d) {
        const fontSize = y.bandwidth();
        if(fontSize < 15 ) return fontSize + 'px';
        return '13px';
      })
      .text(function(d) { return d.president })
      // .transition(t)
      .attr('y', function(d) { return y(d.president) + ((y.bandwidth() / 1.4)); });

}

// end updata function
    }

    g.append('g')
      .attr('class', 'x axis')
      // .attr('transform', 'translate(0, ' + height + ')')
      .call(xAxis);

    g.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y));

    const narrowTimeFrame = (start, end) => {
      let clone = data.presidents.clone();
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
            if(pres.numYearsAlive <= 0) pres.numYearsAlive = 0;
          }
          // clip ending

          if(pres.yearsAlive[0] > end) {
            pres.numYearsAlive = 0
          }

          return pres;
      });

      clone = clone.filter((pres, i) => {
        if(pres.numYearsAlive > 0) {
             return pres;
        }
        if(clone[i + 1]){
          if(clone[i + 1].numYearsAlive > 0) {
            return pres;
          }
        }
      })

      curData = clone;


    }

    let lastScrollPos = 0;

    document.addEventListener('scroll', () => {
      narrowTimeFrame(timeFrameD.start, timeFrameD.end);
      updateChart(curData);
    }, false);

    updateChart(curData);

  });

}
