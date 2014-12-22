/**
* Player.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  connection: 'ram',

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
    directions: {
      type: 'integer',
      defaultsTo: 6
    },

    // weapons: fists, machete, bow, gun - [-1, 0, 1, 2]
    weapons: {
      type: 'array'
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
