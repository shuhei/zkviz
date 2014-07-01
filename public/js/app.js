(function(d3) {
  var diameter = 960;
  var tree = d3.layout.tree()
    .size([360, diameter / 2 - 120])
    .separation(function(a, b) { return (a.parent === b.parent ? 1 : 2) / a.depth; });

  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

  var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .text('a simple tooltip');

  var svg = d3.select('body').append('svg')
    .attr('width', diameter)
    .attr('height', diameter - 150)
  .append('g')
    .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

  draw();

  function draw(host) {
    d3.json('tree.json?host=' + host, function(error, root) {
      console.log(root);

      var nodes = tree.nodes(root);
      var links = tree.links(nodes);

      var link = svg.selectAll('.link')
        .data(links)
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', diagonal);

      var node = svg.selectAll('.node')
        .data(nodes)
      .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')'; });

      node.append('circle')
        .attr('r', 4.5)
        .on('mouseover', function(d) {
          return tooltip.style('visibility', 'visible')
            .text(d.data || 'no data');
        })
        .on('mousemove', function() {
          return tooltip.style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          return tooltip.style('visibility', 'hidden');
        });

      node.append('text')
        .attr('dy', '.31em')
        .attr('text-anchor', function(d) { return d.x < 180 ? 'start' : 'end'; })
        .attr('transform', function(d) { return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)'; })
        .text(function(d) { return d.name; });

      d3.select(self.frameElement).style('height', diameter - 150 + 'px');
    });
  }
})(d3);
