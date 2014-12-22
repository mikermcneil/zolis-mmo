module.exports = {

  description: 'Generate a map, with items',

  inputs: {},

  exits: {
    then: {},
    error: {}
  },

  defaultExit: 'then',

  fn: function createMap(inputs, exits){

    sails.machines.generateMapData().exec({
      then: function (mapData){
        Map.create({
          tiles: mapData.tiles,
          items: mapData.items,
          diff: (function _createDiff (){
            // This diff will be sent and applied by the client to sync their arena
            // diff[0-2] = players
            // diff[0] = new players (append to end)
            // diff[1] = del players indicies (splice, starting in reverse order)
            // diff[2] = player updates (i:index, updated attrs)
            // diff[3-5] = bullets
            // diff[6-8] = items
            return Array.apply([], new Array(9)).map(function () {
              return [];
            });
          })(),
          bullets: []
        }).exec(function (err, newMap) {
          if (err) {
            return exits.error(err);
          }

          exits.then(newMap);
        });
      }
    });
  }
};
