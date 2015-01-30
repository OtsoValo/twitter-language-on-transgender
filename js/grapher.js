var grapher = (function () {
    /*jslint loopfunc: true, browser: true*/
    /*globals alert*/
    'use strict';

    var grapher = {};

    grapher.Graph = function Graph(graph_data_uri, opts) {
      var default_opts = {
        where: "#canvas",
        r: 5,
        width: 500,
        height: 500,
        charge: -80,
        gravity: 0.02,
        linkDistance: 150,
        selfLoopLinkDistance: 20,
        nodeOpacity: .9,
        linkOpacity: .85,
        fadedOpacity: .1,
        mousedOverNodeOpacity: .9,
        mousedOverLinkOpacity: .9,
        nodeStrokeWidth: 1.5,
        nodeStrokeColor: "#333",
        colorField: "color",
        startingColor: "#ccc",
        endingColor: "#BD0026"
      };

      var info_row = function info_row(display_name, value) {
        var $div = $('<div class="row clearfix"></div>')
        var $label = $('<label class="pull-left" style="margin-left: 10px; text-align:right !important; width: 150px">' + display_name + ':</label>');
        var $ins = $('<span class="pull-right" style="margin-left: 5px; text-align: left; width: 100px;"><p>' + value + '</p></div>');
        $div.append($label);
        $div.append($ins);

        return $div;
      };

      var getColor = function getColor(node) {
        var c = '#cccccc';
        if (node.highlight) {
          c = "#FF0000";
        }
        return c;
      };

      var get_graph = function get_graph(graph, opts) {

        var link_tracks = {};
        // Compute the distinct nodes from the links.
        graph.links.forEach(function(link) {
          var t = 'basic';
          if (link.source == link.target) {
            // These are for rendering self reference.  The 'null' vertex is a secret extra vertex.
            t = 'self-loop';
            link.source = link.source + "-null";
            //link.source.type = t;

            //console.log(link)
          }

          link.type = t;
          // add the secret nodes, if link.source doesn't exist
          link.source = graph.nodes[link.source] || (graph.nodes[link.source] = {
            name: link.source,
            type: t
          });
          link.target = graph.nodes[link.target]; // || (graph.nodes[link.target] = {name: link.target});


          link_tracks[link.source.index + "," + link.target.index] = 1;

        });

        return {
          graph: graph,
          link_tracks: link_tracks
        };
      };

      var z = d3.scale.category20c();
      var opts = $.extend({}, default_opts, opts);
      var draw_graph = function draw_graph(graph, opts) {

          var rg = get_graph(graph, opts);

          var graph = rg.graph,
            link_tracks = rg.link_tracks;

          var isConnected = function isConnected(e, t) {
            return link_tracks[e.index + "," + t.index] || link_tracks[t.index + "," + e.index] || e.index === t.index;
          };

          graph.nodes = d3.values(graph.nodes);

          var force = d3.layout.force()
            .nodes(graph.nodes)
            .links(graph.links)
            .linkStrength(function(d) {
              return (d.type == "self-loop" ? 1 : 0.5);
            })
            .size([opts.width, opts.height])
            .linkDistance(function(d) {
              return (d.type == "self-loop" ? opts.selfLoopLinkDistance : opts.linkDistance);
            })
            .gravity(opts.gravity)
            .charge(opts.charge)
            .on("tick", tick);


          //d3.select('svg').remove();
          var svg = d3.select(opts.where).append("svg:svg")
            .attr("width", opts.width)
            .attr("height", opts.height);

          var path = svg.append("svg:g").selectAll("path"),
            circle = svg.append("svg:g").selectAll("circle"),
            text = svg.append("svg:g").selectAll("text");

          var update = function update() {
            path = path.data(force.links());

            var pathEnter = path.enter().append("svg:path");


            path.attr("class", function(d) {
                return "link " + d.type + (d.predicted ? " predicted" : "");
              })
              .attr("style", function(d) {
                // edge width based on weight
                return 'stroke-width: ' + (d.predicted ? 5 : d.weight) + 'px !important;'
              })
              .attr("marker-end", function(d) {
                return "url(#" + d.type + ")";
              });

            path.exit().remove();


            var mouseover_func = function mouseover_func(node) {

              return circle.style("opacity", function(otherNode) {
                return isConnected(node, otherNode) ? opts.mousedOverNodeOpacity : opts.fadedOpacity
              }), path.style("opacity", function(p) {
                return p.source === node || p.target === node ? opts.mousedOverLinkOpacity : opts.fadedOpacity;
              });
            };

            var mouseout_func = function mouseout_func(node) {
              return circle.style("fill", function(node) {
                return getColor(node);
              }).attr("r", function(d) {
                return d.highlight ? opts.r * 1.5 : opts.r;
              }).style("stroke", opts.nodeStrokeColor).style("stroke-width", opts.nodeStrokeWidth).call(force.drag).style("opacity", opts.nodeOpacity), path.style("opacity", opts.linkOpacity);
            }

            circle = circle.data(force.nodes());

            var circleEnter = circle.enter().append("svg:circle")
              .call(force.drag);

            circle.on("click", function(node) {

            }).on("dblclick", function(node) {


            });


            circle.on("mouseover", function(node) {
              return mouseover_func(node);
            }).on("mouseout", function(node) {
              return mouseout_func(node);
            });


            circle.attr("r", function(d) {
              return d.highlight ? opts.r * 1.5 : opts.r;
            }).attr("class", function(d) {
              return '';
            }).style("fill", function(node) {
              return getColor(node);
            });

            circle.exit().remove();

            text = text.data(force.nodes());

            var textEnter = text.enter().append("svg:text");

            text.attr("class", function(d) {
              return d.type
            });

            //var show_id = false;
            // //  // only show a label if the node is being tracked
            // // if ($.inArray(d['name'], tracked_nodes) > -1) {
            // //     show_id = true;
            // // }
            // // A copy of the text with a thick white stroke for legibility.
            // text.append("svg:text")
            //     .attr("x", 8)
            //     .attr("y", ".31em")
            //     .attr("class", "shadow")
            //     .attr("class", function (d) {
            //         return d.type
            //     })
            //     .text(function (d) {
            //         console.log(d);
            //         return show_id?d.name:'';
            //     });

            text
              .attr("x", 8)
              .attr("y", ".31em")
              .attr("class", function(d) {
                //console.log(d);
                return d.type
              })
              .text(function(d) {
                // console.log("here.........");
                //console.log(d);
                return d.name;
                //return "here";
              });

            text.exit().remove();


            force.start();
          }

          function tick() {

            path.attr("d", function(d) {
                if (d.type != "self-loop") {
                  // Use elliptical arc path segments to doubly-encode directionality.
                  var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                } else if (d.type == "self-loop") {
                  // draw a little loop back to the self, keeping in mind that all self loops from the dummy node toward the self.
                  var dx = d.source.x - d.target.x,
                    dy = d.source.y - d.target.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                  a = Math.atan2(dx, dy);
                  da = 0.4;
                  b = 1;
                  return "M" + d.target.x + "," + d.target.y + "q" +
                    b * dr * Math.sin(a) + "," + b * dr * Math.cos(a) + " " +
                    b * dr * Math.sin(a + da) + "," + b * dr * Math.cos(a + da) + " " + " T " + d.target.x + "," + d.target.y;
                }
              }).attr("x1", function(d) {
                return d.source.x;
              })
              .attr("y1", function(d) {
                return d.source.y;
              })
              .attr("x2", function(d) {
                return d.target.x;
              })
              .attr("y2", function(d) {
                return d.target.y;
              });

            circle.attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
            /*
            .attr("cx", function(d) { return d.x = Math.max(r, Math.min(w - r, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(r, Math.min(h - r, d.y)); });
            */
            text.attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
          }

          update();
        };

      d3.select(opts.where).selectAll("*").remove();
      d3.json(graph_data_uri, function(error, graph) {
        draw_graph(graph, opts);
      });
    };
    return grapher;

})();
