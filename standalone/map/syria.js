const margin = {top: 10, left: 10, bottom: 10, right: 10};
let width = 800 - margin.left - margin.right;
let height = 700 - margin.top - margin.bottom;
const mapRatio = 0.5;
const syriaCenter = [38, 35];
const mapRatioAdjuster = 6;

const projection = d3.geoMercator()
      .center(syriaCenter)
      .scale(width * 1.1 * [mapRatio + mapRatioAdjuster]);

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

// adjust map size when browser window size changes
function resize() {
  width = parseInt(d3.select('#viz').style('width'));
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

    function fill(d) {
      const governorate = d.properties.NAME_1;
      const district = d.properties.NAME_2;
      const result = s.filter(obj => obj.governorate === governorate);
      const or = result[0].districts[district];
      if (or > 17) return '#fcaf6d';
      else if (or > 12) return '#fdba80';
      else if (or > 9) return '#fdc494';
      else if (or > 7) return '#fdcfa7';
      else if (or > 5) return '#fed9ba';
      else if (or > 3) return '#fee4cd';
      else if (or > 0) return '#feeee1';
      return '#fff9f4';
    }

    function mouseover(d) {
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
      d3.selectAll('.district').style('filter', 'contrast(30%)');
//      d3.select(this).style('filter', 'drop-shadow(5px 5px 5px rgba(0,0,0,0.5))');
      d3.select(this).style('filter', 'none');
      d3.select(this).style('stroke-width', 1.5);
    }

    function mouseout() {
      d3.selectAll('.district').style('filter', 'none');
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
      .attr('fill', d => fill(d))
      .attr('district', d => d.properties.NAME_2)
      .attr('stroke', '#404040')
      .style('filter', '6px 9px 9px rgba(0, 0, 0, .7)')
      .attr('stroke-width', 0.3)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
  });
});

