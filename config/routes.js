
module.exports.routes = {

// TODO: later

  /**
   * [description]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  'POST /me/keydown': function (req, res) {

    //
    // on socket command (movement/attack), update game state
    //



    var key = req.param('keycode');
    console.log('keydown: %s',key);

    // Attack
    if (key == 32 || key == 90) {
      Player.update(req.session.me, {
        attacking: true
      }).exec(function (err) {
        if (err) return res.negotiate(err);
        return res.send();
      });
      return;
    }

    // Move
    if (key > 36 && key < 41) {

      Player.findOne(req.session.me).exec(function (err, player){
        if (err) return res.negotiate(err);
        if (!player) return res.notFound();

        // remove key if was in list before
        if (player.keys.indexOf(key) != -1) {
          player.keys.splice(player.keys.indexOf(key), 1);
        }

        // set key to first position
        player.keys.unshift(key);

        // Save player
        player.save(function (err) {
          if (err) return res.negotiate(err);
          return res.send();
        });
      });
      return;
    }

    // Unrecognized key:
    return res.notFound();

  },

  /**
   * [description]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  'POST /me/keyup': function (req, res) {

    var key = req.param('keycode');
    console.log('keyup: %s',key);

    Player.findOne(req.session.me).exec(function (err, player){
      if (err) return res.negotiate(err);
      if (!player) return res.notFound();

      player.keys.splice(player.keys.indexOf(key), 1);
      player.save(function (err){
        if (err) return res.negotiate(err);
        return res.send();
      });
    });
  },

//   /**
//    * [description]
//    * @param  {[type]} req [description]
//    * @param  {[type]} res [description]
//    * @return {[type]}     [description]
//    */
//   'POST /game/chat': function (req, res) {
//     return res.send();
//   },


  /**
   * Join the game.
   *
   * @param {String} name
   */
  'PUT /game': function (req, res) {

    req.validate({
      name: 'string'
    });

    var name = req.param('name').substr(0, 17);

    // Don't allow non-alphabetic characters
    if (!/^[a-zA-Z]+$/.test(name)) {
      return res.badRequest();
    }

    Player.find({
      name: name
    }).exec(function (err, existingPlayersWithName){
      if (err) return res.negotiate(err);

      if (existingPlayersWithName.length > 0) {
        return res.badRequest({
          name: name,
          dead: _.any(existingPlayersWithName, {isDead: true})
        });
      }

      Map.find().limit(1).populate('players').exec(function (err, maps){
        if (err) return exits.error(err);
        if (!maps[0]) {
          return exits.notFound(new Error('expected map to exist'));
        }

        // Load other players from map
        var otherPlayers = maps[0].players;

        // Decide location for player on map
        var x;
        var y;
        x = Math.floor(Math.random() * 600) - 300;
        y = Math.floor(Math.random() * 400) - 200;
        while (CollisionService.hasCollision({x: x, y: y}, otherPlayers) || CollisionService.hasTerrainCollision(maps[0].tiles, x, y)) {
          x = Math.floor(Math.random() * 600) - 300;
          y = Math.floor(Math.random() * 400) - 200;
        }


        console.log('\n\n\n****** CREATING PLAYER ******');
        console.log('\n\n\n****** CREATING PLAYER ******');
        console.log('\n\n\n****** CREATING PLAYER ******');
        console.log('\n\n\n****** CREATING PLAYER ******');
        console.log('\n\n\n****** CREATING PLAYER ******');
        console.log('\n\n\n****** CREATING PLAYER ******');
        Player.create({
          name: name,
          x: x,
          y: y,
          socketId: sails.sockets.id(req)
        }).exec(function (err, newPlayer){
          if (err) {
            return res.negotiate(err);
          }

          // Save player id to session
          req.session.me = newPlayer.id;

          // Add player to map
          // console.log('\n\n\n\n\n***********\nPERSISTING PLAYER:', Player.serialize(newPlayer));
          maps[0].players.add(newPlayer.id);
          maps[0].diff[0].push(Player.serialize(newPlayer));
          maps[0].save(function (err){
            if (err) return res.negotiate(err);
            return res.send(200, name);
          });

        });//</Player.create()>

      });//</Map.find()>

    });
  }
};
