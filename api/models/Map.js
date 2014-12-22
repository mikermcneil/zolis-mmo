/**
* Map.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  serialize: function (record){
    var data = _.cloneDeep(record);
    data.players = (function (players){
      return _.reduce(players, function (memo, player){
        memo.push(Player.serialize(player));
        return memo;
      }, []);
    })(data.players);
    // console.log(data);
    return data;
  },


  attributes: {



    tiles: {
      type: 'json'
      // e.g.
      /*
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ]
      */
    },



    items: {
      type: 'json'
      // e.g.
      /*
        [
          {
            n: 1,
            x: 232,
            y: 381
          },
          ...
        ]
       */
    },

    diff: {
      type: 'json',
      // e.g.
      /*
        [
          []
        ]
       */
    },


    players: {
      collection: 'Player',
      dominant: true
    },

    bullets: {
      type: 'json',
      // TODO: prbly use an association
    }

  }
};

