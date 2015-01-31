(function() {

  $(document).ready(function() {

    var states = ['ak', 'al', 'ar', 'az', 'ca', 'co', 'ct', 'dc', 'de', 'fl', 'ga',
      'hi', 'ia', 'id', 'il', 'in', 'ks', 'la', 'ma', 'md', 'me', 'mi', 'mn', 'mo',
      'ms', 'mt', 'nc', 'nd', 'ne', 'nh', 'nj', 'nm', 'nv', 'ny', 'oh', 'ok', 'or',
      'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'va', 'vt', 'wa', 'wi', 'wv', 'wy'];

    _(states).forEach(function(state){
      //console.log(state);
      $('#stateDropDownMenu ul.dropdown-menu').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + state + '</a></li>');
    }).value();

    $("#stateDropDownMenu ul.dropdown-menu li a").click(function(){
      $(this).parents(".dropdown").find('.btn').html($(this).text() + '&nbsp;<span class="caret"></span>');
      $(this).parents(".dropdown").find('.btn').val($(this).text());

      state = $(this).text()
      $(".label_all").text(state.toUpperCase() + ": ALL");

      grapher.Graph('./data/networks/all.' + state + '.json', {
        where: "#canvas_all",
        r: 8,
        gravity: 0.02,
        linkDistance: 150,
        width: 500,
        height: 500
      });

      cooccurrence.Matrix('./data/networks/all.' + state + '.json', {
        where: "#cooccurrence_matrix_all",
        width: 500,
        height: 500
      });

      $(".label_trans").text(state.toUpperCase() + ": TRANS*");

      grapher.Graph('./data/networks/trans.' + state + '.json', {
        where: "#canvas_trans",
        r: 8,
        gravity: 0.02,
        linkDistance: 150,
        width: 500,
        height: 500
      });

      cooccurrence.Matrix('./data/networks/trans.' + state + '.json', {
        where: "#cooccurrence_matrix_trans",
        width: 500,
        height: 500
      });

      $("#tagcloud_all").html('<img src="./data/tagclouds/' + state + '.all.tagcloud.png" width="100%" class="img-thumbnail"></img>');
      $("#tagcloud_trans").html('<img src="./data/tagclouds/' + state + '.trans.tagcloud.png" width="100%" class="img-thumbnail"></img>');

    });


  });

}).call(this);
