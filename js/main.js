(function() {

  $(document).ready(function() {

    grapher.Graph('./data/networks/all.ny.json', {
      where: "#canvas_1",
      r: 8,
      gravity: 0.02,
      linkDistance: 150,
      width: 800,
      height: 800
    });

    grapher.Graph('./data/networks/trans.ny.json', {
      where: "#canvas_2",
      r: 8,
      gravity: 0.02,
      linkDistance: 150,
      width: 800,
      height: 800
    });
  });

}).call(this);
