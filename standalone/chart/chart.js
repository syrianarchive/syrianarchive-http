let units = [];
let data = [];

d3.json('https://api.syrianarchive.org/incidents').then((d) => {
  const urlString = window.location.href;
  const url = new URL(urlString);
  const collectionName = url.searchParams.get('collection');
  units = d.units;
  units = _.filter(units, u => _.includes(u.clusters.collections,collectionName));
  units = _.filter(units, u => u.annotations.incident_date !== undefined);
  drawChart();
});

const drawChart = () => {
  // setting up the data in this.props.units to the chart.
  units.forEach((d) => {
    const formatedDate = moment(d.annotations.incident_date).format('YYYY-MM-DD');
    if (formatedDate === 'Invalid date') {
      d.annotations.incident_date = moment(d.annotations.incident_date, 'DD-MM-YYYY').format('YYYY-MM-DD'); // eslint-disable-line
    } else {
      d.annotations.incident_date = formatedDate; // eslint-disable-line
    }
  });

  units = _.groupBy(units, (value) =>
                    value.annotations.incident_date
                   );

  const formatDate = d3.timeParse('%Y-%m-%d');

  for (const d in units) { // eslint-disable-line
    data.push({
      date: formatDate(d),
      counts: Object.values(units[d]).length,
      incidents: Object.values(units[d])
    });
  }

  // add dates which don't have incidents
  const dates = [];
  const findDate = data.map((d) => moment(d.date, 'YYYY-MM-DD'));
  const startDate = moment.min(findDate);
  const endDate = moment.max(findDate);

  for (let date = moment(startDate); date.diff(endDate) < 0; date.add(1, 'days')) {
    let d = moment(date).format('YYYY-MM-DD');
    d = formatDate(d);
    dates.push(d);
  }

  const margin = {top: 5, right: 0, bottom: 30, left: 20};
  const width = Math.floor(document.body.clientWidth);
  const height = 200 - margin.top - margin.bottom;

  const x = d3.scaleTime()
        .range([0, width]);

  const y = d3.scaleLinear()
        .range([height, 0]);

  const line = d3.line()
        .x((d) => x(d.date))
        .y((d) => y(d.counts))
        .curve(d3.curveStepAfter);

  const xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y'));

  const yAxis = d3.axisLeft(y).ticks(4);
  const chart = d3.select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

  const g = chart.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // eslint-disable-line

  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.counts)]);

  const newData = dates.map((d) => _.find(data, {date: d}) || {date: d, counts: 0});

  g.append('g')
    .attr('transform', 'translate(0,' + height + ')') // eslint-disable-line
    .call(xAxis)
    .select('.domain');


  g.append('g')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em');

  g.append('path')
    .data([data])
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 3)
    .attr('d', line(newData));
};
