const margin = {top: 10, left: 10, bottom: 10, right: 2};
let width = parseInt(d3.select('#viz').style('width'), 10) - margin.left - margin.right;
let height = 700 - margin.top - margin.bottom;
const mapRatio = 0.5;
const syriaCenter = [38, 35];
const mapRatioAdjuster = 6;

const projection = d3.geoMercator()
      .center(syriaCenter)
      .scale(width * [mapRatio + mapRatioAdjuster]);

const svg = d3.select('#viz')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

const path = d3.geoPath()
      .projection(projection);

const features =  svg.append('g')
      .attr('transform', 'translate(-200,70)');

const gov = d3.select('#gov');
const dis = d3.select('#dis');
const num = d3.select('#num');
const els = document.getElementById('viz');

// adjust map size when browser window size changes
function resize() {
  width = parseInt(d3.select('#viz').style('width'), 10);
  width = width - margin.left - margin.right;
  height = width * mapRatio;

  // update projection
  projection.center(syriaCenter)
    .scale(width * 1.2 * [mapRatio + mapRatioAdjuster]);

  // resize map container
  svg.style('width', width + 'px')
    .style('height', height + 'px');

  // resize map
  svg.selectAll('path').attr('d', path);
}

d3.select(window).on('resize', resize);

d3.json('./sources.json').then((s) => {
  d3.json('./syria-districts-topojson.json').then((syr) => {

    const color = {
      original: {
        first: '#fcaf6d',
        second: '#fdba80',
        third: '#fdc494',
        fourth: '#fdcfa7',
        fifth: '#fed9ba',
        sixth: '#fee4cd',
        seventh: '#feeee1'
      },
      dim: {
        first: '#a58e7a',
        second: '#a59180',
        third: '#a58e7a',
        fourth: '#a5978b',
        fifth: '#a59a91',
        sixth: '#a59e97',
        seventh: '#a5a19d'
      }
    };

    function coloriz(d, type){
      const governorate = d.properties.NAME_1;
      const district = d.properties.NAME_2;
      const result = s.filter(obj => obj.governorate === governorate);
      const numberOfSources = result[0].districts[district];
      if (numberOfSources > 17) return color[type].first ;
      else if (numberOfSources > 12) return color[type].second;
      else if (numberOfSources > 9) return color[type].third;
      else if (numberOfSources > 7) return color[type].fourth;
      else if (numberOfSources > 5) return color[type].fifth;
      else if (numberOfSources > 3) return color[type].sixth;
      return color[type].seventh;
    }

    // It's better to use css's filter rule with contrast, although there is a bug with it in chrome https://stackoverflow.com/questions/32567156/why-dont-css-filters-work-on-svg-elements-in-chrome
    // https://bugs.chromium.org/p/chromium/issues/detail?id=109224    
    function mouseover(d) {
      const Ocolor = d3.select(this).attr('Ocolor');
      const governorate = d.properties.NAME_1;
      const district = d.properties.NAME_2;
      const result = s.filter(obj => obj.governorate === governorate);
      const soruces = result[0].districts[district];
      gov.transition().style('opacity', 1);
      gov.html(d.properties.NAME_1);
      dis.transition().style('opacity', 1);
      dis.html(d.properties.NAME_2);
      num.transition().style('opacity', 1);
      num.html(soruces);
      d3.selectAll('.district').attr('fill', d => coloriz(d, 'dim'));
      d3.select(this).attr('fill', Ocolor);
      d3.select(this).style('stroke-width', 1.5);
    }

    function mouseout() {
      d3.selectAll('.district').attr('fill', d => coloriz(d, 'original'));
      gov.transition().duration(200).style('opacity', 0);
      dis.transition().duration(200).style('opacity', 0);
      num.transition().duration(200).style('opacity', 0);
      d3.select(this).style('stroke-width', 0.3);
    }

    features.selectAll('path')
      .data(topojson.feature(syr, syr.objects.SYR_adm2).features)
      .enter()
      .append('path')
      .attr('class', 'district')
      .attr('d', path)
      .attr('fill', d => coloriz(d, 'original'))
      .attr('Ocolor', d => coloriz(d, 'original'))
      .attr('district', d => d.properties.NAME_2)
      .attr('stroke', '#404040')
      .attr('stroke-width', 0.3)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
  });
});

