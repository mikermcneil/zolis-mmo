module.exports = {

  description: 'Generate a map, with items',

  inputs: {},

  exits: {

    then: {

      example: {
        tiles: [
          [
            4
          ]
        ],
        items: [{
          n: 2,
          x: 235,
          y: 291
        }]
      }

    }
  },

  defaultExit: 'then',

  fn: function generateMap(inputs, exits){


    //game
    var random = (function rng() {
      var x = 123456789,
        y = 362436069,
        z = 521288629,
        w = 88675123,
        t;
      return function rand() {
        t = x ^ (x << 11);
        x = y;
        y = z;
        z = w;
        w = w ^ (w >> 19) ^ (t ^ (t >> 8));
        return (w * 2.3283064365386963e-10) * 2;
      };
    })();

    var map = (function generateMap() {
      var m = [];
      for (var y = -600 / 2; y < 600 / 2; y += 14) {
        var temp = [];
        for (var x = -800 / 2; x < 800 / 2; x += 14) {
          var rand = random();
          if (rand > 0.99) {
            temp.push(3);
          } else if (rand > 0.98) {
            // non-traversable stump
            temp.push(4);
          } else if (rand > 0.92) {
            temp.push(2);
          } else if (rand > 0.82) {
            temp.push(6);
          } else if (rand > 0.72) {
            temp.push(5);
          } else if (rand > 0.62) {
            temp.push(1);
          } else {
            temp.push(0);
          }
        }
        m.push(temp);
      }
      return m;
    })();

    var items = (function generateMap() {
      var m = [];
      random();
      random();
      random();
      for (var y = -600 / 2; y < 600 / 2; y += 14) {
        for (var x = -800 / 2; x < 800 / 2; x += 14) {
          var rand = random();
          if (rand > 0.9996) {
            m.push({
              n: 2,
              x: x,
              y: y
            });
          } else if (rand > 0.943 && rand < 0.945) {
            m.push({
              n: 1,
              x: x,
              y: y
            });
          } else if (rand > 0.930 && rand < 0.935) {
            m.push({
              n: 0,
              x: x,
              y: y
            });
          }
        }
      }
      return m;
    })();


    return exits.then({
      tiles: map,
      items: items
    });
  }
};
