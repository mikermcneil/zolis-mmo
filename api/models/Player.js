/**
* Player.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  serialize: function (player){
    var data = {};
     // name
    data.n = player.n || player.name;
    data.x = player.x;
    data.y = player.y;

    // health
    data.h = player.h || player.health;

    // kills
    data.s = player.s || player.kills;

    // weapons: fists, machete, bow, gun - [-1, 0, 1, 2]
    data.w = player.w || player.weapon;

    // directions:
    // left, up/left, up, up/right, right, right/down, down, down/left
    // 0,    1,       2,  3,        4,     5,          6,     7
    data.d = player.d || player.direction;

    // animation frame
    data.f = player.f || player.frame;

    // keys
    data.k = player.k || player.keys;

    // attacking - bool
    data.a = player.a || player.attacking;
    return data;
  },

  attributes: {

    name: {
      type: 'string',
      unique: true
    },

    x: {
      type: 'float'
    },

    y: {
      type: 'float'
    },

    // health
    health: {
      type: 'float',
      defaultsTo: 100
    },

    // number of kills committed by this player
    kills: {
      type: 'integer',
      defaultsTo: 0
    },

    // directions:
    // left, up/left, up, up/right, right, right/down, down, down/left
    // 0,    1,       2,  3,        4,     5,          6,     7
    direction: {
      type: 'integer',
      defaultsTo: 6
    },

    // weapons: fists, machete, bow, gun - [-1, 0, 1, 2]
    weapon: {
      type: 'integer',
      enum: [-1, 0, 1, 2],
      defaultsTo: -1
    },

    // animation frame
    frame: {
      type: 'integer',
      defaultsTo: 1
    },

    // whether the player is dead
    isDead: {
      type: 'boolean',
      defaultsTo: false
    },

    // ???
    keys: {
      type: 'array',
      defaultsTo: []
    },

    // whether the player is currently attacking
    attacking: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};
