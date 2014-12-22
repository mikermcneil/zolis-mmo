module.exports.bootstrap = function (done){

  setupGame(sails.io, done);
};





function setupGame(io, done){

  // TODO: deprecate all of this so the server can scale outside of RAM

  // State

  var highScores = [];

  // stub 10 high scores
  for (var i = 0; i < 10; i++) {
    highScores.push({
      name: '',
      score: ''
    });
  }


  sails.machines.createMap().exec({

    error: function (err){
      return done(err);
    },
    then: function (arena){

      io.on('connection', function (socket){
        var  p;

        // Load arena
        Map.find().limit(1).populate('players').exec(function (err, maps) {
          if (err) {
            sails.log.error('Error loading arena for newly connected socket:',err);
            return;
          }

          // on socket connect, start streaming game data to them
          socket.emit('highScores', highScores.slice(0, 10));

          console.log('\n\n\n\n\n*****EMITTING ITEMS: ',Map.serialize(maps[0]).items);
          socket.emit('setState', Map.serialize(maps[0]));
        });


        // on socket disconnect, kill them
        socket.on('disconnect', function() {
          if (p) p.h = 0;
        });

        // // on socket command (movement/attack), update game state
        // socket.on('keydown', function(key) {
        //   if (!p) return;

        //   if (key == 32 || key == 90) {
        //     p.a = 1;
        //     return p.a;
        //   }
        //   if (key > 36 && key < 41) {

        //     // remove key if was in list before
        //     if (p.k.indexOf(key) != -1) p.k.splice(p.k.indexOf(key), 1);

        //     // set key to first position
        //     p.k.unshift(key);
        //   }
        // });
        // socket.on('keyup', function(key) {
        //   if (!p) return;
        //   p.k.splice(p.k.indexOf(key), 1);
        // });

        // chat
        socket.on('chat', function(msg) {
          io.sockets.emit('chat', (p && p.n || '☠') + ': ' + msg);
        });
      });





      //////////////////////////////////////////////////////////////////////////////
      // Start game loop
      //////////////////////////////////////////////////////////////////////////////
      var frame = 0;
      setInterval(function () {

        // Load arena
        Map.find().limit(1).populate('players').exec(function (err, maps) {
          if (err) {
            sails.log.error('Error loading arena for newly connected socket:',err);
            return;
          }
          // Build `physics` fn.
          // TODO: improve strategy
          var physics = ToPhysics(maps[0]);

          // update game state
          var diff = physics(++frame);

          // don't send if empty
          if (!diff.reduce(function (total, x) {
            return total + x.length;
          }, 0)) return;

          //console.log(diff)
          // send game state data

          var found = false;
          var i = diff.length - 1;
          while (diff[i] && diff[i].length === 0) {
            diff.splice(i, 1);
          }

          io.sockets.emit('message', diff);
        });
      }, 1000 / 30);
      // }, 1000 / 3);



      // Continue lifting the server
      return done();

    } // </generateMap->then>
  });





  /**
   * [Bullet description]
   * @param {[type]} type [description]
   * @param {[type]} x    [description]
   * @param {[type]} y    [description]
   * @param {[type]} dir  [description]
   * @param {[type]} n    [description]
   */
  function Bullet(type, x, y, dir, n) {
    // types: arrow, bullet - [0, 1]
    this.t = type;
    this.n = n;
    this.x = x;
    this.y = y;
    this.d = dir;
  }



  /**
   * [clone description]
   * @param  {[type]} o [description]
   * @return {[type]}   [description]
   */
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }





  /**
   * [differ description]
   * @param  {[type]} current [description]
   * @param  {[type]} clone   [description]
   * @return {[type]}         [description]
   */
  function differ(current, clone) {
    var diffs = [];
    for (var i = 0; i < current.length; i++) {
      var update = {
        i: i
      };
      var obj = current[i];
      var cloned = clone[i];
      for (var key in obj) {
        if (key == 'k') continue;
        if (key == 'keys') continue;
        if (key == 'id') continue;
        if (typeof obj[key] === 'object') continue;
        if (typeof obj[key] === 'function') continue;
        if (obj[key] != cloned[key]) update[key] = +obj[key].toFixed(2);
      }
      if (Object.keys(update).length > 1) diffs.push(update);
    }
    return diffs;
  }





  function ToPhysics(arena) {


    var diff = arena.diff;
    delete arena.diff;

    // diff = Array.apply([], new Array(9)).map(function () {
    //   return [];
    // });

    /**
     * [physics description]
     * @param  {[type]} frame [description]
     * @return {[type]}       [description]
     */
    return function physics(frame) {
      var players = arena.players;
      var bullets = arena.bullets;
      var items = arena.items;
      var arenaClone = clone(arena);

      // dir: [delta x, delta y]
      var sqrt2 = Math.sqrt(2);
      var keymap = {
        0: [-2, 0], // left
        1: [-sqrt2, -sqrt2], // up/left
        2: [0, -2], // up
        3: [sqrt2, -sqrt2], // up/right
        4: [2, 0], // right
        5: [sqrt2, sqrt2], // down/right
        6: [0, 2], // down
        7: [-sqrt2, sqrt2] // down/left
      };

      // player movement
      for (var i = 0; i < players.length; i++) {
        var player = players[i];
        // if (!player.keys) {
        //   console.log('player.keys', player.keys);
        //   console.log('player.k', player.k);
        // }
        // console.log('handling player movement:');
        // console.log('  •-> player.keys[0] ::',player.keys[0]);
        // console.log('  •-> player.keys[1] ::',player.keys[1]);
        var key;
        var key1 = (player.keys[0] || -1) - 37;
        var key2 = (player.keys[1] || -1) - 37;
        if (!keymap[key2]) {
          key = key1 * 2;
        }
        else {
          // adding works for up/left, up/right, down/right
          // does not work for opposite or down/left

          // opposite
          if ((key1 - key2) % 2 == 0) {
            key = -1;
          }
          else if (key1 == 0 && key2 == 3 || key1 == 3 && key2 == 0) {
            // down/left
            key = 7;
          } else {
            key = key1 + key2;
          }
        }

        if (player.attacking) {
          if (frame % 3 == 0) {
            // maybe remove an attack frame
            if (player.frame == 3) {
              player.frame++;
              player.attacking = (player.attacking + 1) % 5;
            } else if (player.frame == 4) {
              // here is where we check for hit (if melee weapon)
              if (player.weapon < 1) {
                var weapon = {
                  x: player.x + keymap[player.direction][0] * 5,
                  y: player.y + keymap[player.direction][1] * 5
                };
                var hit = CollisionService.hasCollision(weapon, players.slice(0, i).concat(players.slice(i + 1)));
                if (hit) {
                  hit.h -= 10;
                  if (hit.h <= 0) {
                    player.kills++;
                  }
                }
              } else {
                var bullet = new Bullet(player.weapon - 1, player.x, player.y, player.direction, player.name);
                arena.bullets.push(bullet);
                diff[3].push(bullet);
                arenaClone.bullets.push(bullet);
              }
              player.frame++;
              player.attacking = (player.attacking + 1) % 5;
            } else {
              player.frame = 3;
              player.attacking = (player.attacking + 1) % 5;
            }
          }
        } else if (keymap[key]) {
          if (frame % 6 == 0) {
            player.frame = (player.frame + 1) % 4;
          }
          player.x += keymap[key][0];
          player.y += keymap[key][1];
          var outsideMap = player.x < -400 || player.x > (400 - 16) || player.y < -300 || player.y > (300 - 18);
          var collidePlayer = CollisionService.hasCollision(player, players.slice(0, i).concat(players.slice(i + 1)));
          var collideTerrain = CollisionService.hasTerrainCollision(arena.tiles, player.x, player.y);
          if (outsideMap || collidePlayer || collideTerrain) {
            player.x -= keymap[key][0];
            player.y -= keymap[key][1];
          }
          player.direction = key;
        } else {
          player.frame = 1;
        }
      }

      // bullet movement/collision
      for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        bullet.x += keymap[bullet.d][0] * 2;
        bullet.y += keymap[bullet.d][1] * 2;
        var player = CollisionService.hasCollision(bullet, players);
        if (player && bullet.n != player.name) {
          // arrow does 10 dmg, bullet does 20
          player.health -= (bullet.t == 0) ? 10 : 20;
          if (player.health <= 0) {
            var id = bullet.n;
            for (var i = 0; i < players.length; i++) {
              if (players[i].name == id) {
                players[i].kills++;
                break;
              }
            }
          }

          diff[4].push(i);
          bullets.splice(i, 1);
          arenaClone.bullets.splice(i, 1);
        } else if (bullet.x < -400 || bullet.x > 400 || bullet.y < -300 || bullet.y > 300) {
          diff[4].push(i);
          bullets.splice(i, 1);
          arenaClone.bullets.splice(i, 1);
        }
      }

      // player pickup items
      for (var i = items.length - 1; i >= 0; i--) {
        var item = items[i];
        var player = CollisionService.hasCollision(item, players);

        // if colliding with item, pick it up
        if (player) {

          // item is better than current
          if (player.weapon < item.n) {
            var weapon = item.n;

            // pick up the item
            if (player.weapon != -1) {

              // drop current weapon
              item.n = player.weapon;
            } else {

              // remove the item
              items.splice(i, 1);
              diff[7].push(i);
              arenaClone.items.splice(i, 1);
            }

            player.weapon = weapon;
          }
        }
      }

      // player deaths
      for (var i = players.length - 1; i >= 0; i--) {
        var player = players[i];
        if (player.health <= 0) {
          // drop weapon
          if (player.weapon != -1) {
            var item = {
              n: player.weapon,
              x: player.x,
              y: player.y
            };
            items.push(item);
            arenaClone.items.push(item);
            diff[6].push(item);
          }
          // anounce death
          io.sockets.emit('alert', player.name + ' has been killed');

          // update high scores
          // TODO - only send if top 10 change
          highScores.push({
            name: player.name,
            score: player.kills * 1000
          });

          highScores.sort(function (a, b) {
            return -a.score + b.score;
          });

          // send high score list
          io.sockets.emit('highScores', highScores.slice(0, 10));

          taken.splice(taken.indexOf(player.name), 1);
          player.isDead = true;
          players.splice(i, 1);
          diff[1].push(i);
          arenaClone.players.splice(i, 1);
        }
      }


      // calculate update diffs
      // players
      var pDiffs = differ(_.map(players, function (player){ return Player.serialize(player); }), _.map(arenaClone.players, function (player){ return Player.serialize(player); }));
      // bullets
      var bDiffs = differ(bullets, arenaClone.bullets);
      // items
      var iDiffs = differ(items, arenaClone.items);

      console.log('playerdiff:', pDiffs);

      diff[2] = pDiffs;
      diff[5] = bDiffs;
      diff[8] = iDiffs;

      var t = diff;
      diff = Array.apply([], new Array(9)).map(function () {
        return [];
      });

      return t;
    };
  }
}














