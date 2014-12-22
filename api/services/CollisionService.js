module.exports = {

  hasTerrainCollision: function (map, x, y){
    return map[Math.round((y + 2 + 300) / 14)][Math.round((x + 2 + 400) / 14)] == 4 ? true : false;
  },



  /**
   * [collide description]
   * @param  {[type]} a  [description]
   * @param  {[type]} bs [description]
   * @return {[type]}    [description]
   */
  hasCollision: function (a, bs) {
    var PLAYER_HEIGHT = 18;
    var PLAYER_WIDTH = 12;

    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (!(a.y + PLAYER_HEIGHT < b.y || a.y > b.y + PLAYER_HEIGHT || a.x + PLAYER_WIDTH < b.x || a.x > b.x + PLAYER_WIDTH)) return b;
    }
    return false;
  }

};
