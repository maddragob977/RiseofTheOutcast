



BasicGame.Game = function (game) {

}

BasicGame.Game.prototype = {




    create: function () {
        this.turnLeft = true;
        this.setUpMap();
        //this.displayDialogue();

        this.setupEnemies();
        this.setupPlayer()
        this.setupEnergyBalls();
        this.setupAudio();
        this.setUpHealthDrops();
        this.setUpText();
    },

    setupAudio: function () {
        this.enemyDieSFX = this.add.audio('grunt');
        this.punchSFX = this.add.audio('punch');
        this.hitSFX = this.add.audio('hit');
        this.BGM = this.add.audio('bgm');
        this.playerHitSFX = this.add.audio('playerHit');
        this.BGM.play("", 0, 0.3, true, true);
    },

    setupPlayer: function () {

        this.player = this.add.sprite(460, 400, 'Player');
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.animations.add('idleLeft', [6], 20, false);
        this.player.animations.add('idleRight', [12], 20, false);
        this.player.animationInstance3 = this.player.animations.add('hitLeft', [18, 19], 5, false);
        this.player.animationInstance4 = this.player.animations.add('hitRight', [20, 21], 5, false);
        this.player.animations.add('dieLeft', [22, 23], 10, false);
        this.player.animations.add('walkLeft', [0, 1, 2], 10, false);
        this.player.animations.add('walkRight', [3, 4, 5], 10, false);
        this.player.animationInstance1 = this.player.animations.add('attackRight', [13, 14, 15, 16, 17, 13], 10, false);
        this.player.animationInstance2 = this.player.animations.add('attackLeft', [7, 8, 9, 10, 11, 7], 10, false);
        this.player.anchor.setTo(0.5, 0.5);
        this.player.scale.setTo(2, 2);
        this.player.body.setSize(30, 50);
        this.player.invulUntil = 0;
        this.player.speed = 300;
        this.player.body.collideWorldBounds = true;
        this.player.maxhealth = 100;
        this.player.health = this.player.maxhealth;
        this.player.invulTill = 0;
        this.player.life = true;

        this.hpbar = this.add.sprite(0, 0, 'hpbar');
        this.cropRect = new Phaser.Rectangle(0, 0, 0, this.hpbar.height);
        var tween = this.add.tween(this.cropRect).to({ width: this.player.health }, 3000, Phaser.Easing.Linear.Out, false, 0, 0, false);
        this.hpbar.cropEnabled = true;
        this.hpbar.crop(this.cropRect);
        tween.start();
    },

    setupEnergyBalls: function (){
        this.energyPool = this.add.group();
        this.energyPool.enableBody = true;
        this.energyPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.energyPool.createMultiple(100, 'energyBall');
        this.energyPool.setAll('anchor.x', 0.5);
        this.energyPool.setAll('anchor.y', 0.5);
        this.energyPool.setAll('outOfBoundsKill', true);
        this.energyPool.setAll('checkWorldBounds', true);
        this.energyPool.setAll('damage', 10);
        this.nextShotAt = 0;
    },

    fireEnergyBall: function(){
        if (this.nextShotAt > this.time.now) {
            return;
        }
        if (this.energyPool.countDead() === 0) {
            return;
        }
        this.nextShotAt = this.time.now + 10000;

        var energyBall = this.energyPool.getFirstExists(false);
        if (this.turnLeft === true) {
            this.player.play('attackLeft');
            energyBall.scale.x = -1;
            energyBall.reset(this.player.x - 10, this.player.y);
            energyBall.body.velocity.x = -400;
        }
        else {

            this.player.play('attackRight');
            energyBall.reset(this.player.x + 10, this.player.y);
            energyBall.body.velocity.x = +400;
        }
    },

    update: function () {

        this.handlePlayerInput();
        this.handleCollision();
        this.bruteAI();
        this.healthbar();
        if (this.nextEnemyAt < this.time.now && this.bruteGroup.countDead() > 0) {
            this.nextEnemyAt = this.time.now + this.enemyDelay;
            var brute = this.bruteGroup.getFirstExists(false);
            if (this.rnd.integerInRange(0, 10) < 5) {
                brute.reset(960, this.rnd.integerInRange(200, 600), 3);
            }
            else {
                brute.reset(0, this.rnd.integerInRange(200, 600), 3);
            }
        }



    },
    handleCollision: function () {
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.overlap(this.player, this.bruteGroup, this.EnemyHit, null, this);
        this.game.physics.arcade.overlap(this.player, this.healthPool, this.playerHealthUp, null, this);
        this.game.physics.arcade.overlap(this.energyPool, this.bruteGroup, this.enemyHitByBullet, null, this);
        this.game.debug.body(this.player);

    },

    enemyHitByBullet: function(bullet,enemy){
        this.enemyTakeDamage(enemy, bullet.damage);

        bullet.kill();

    },




    handlePlayerInput: function () {

        if (this.player.frame === 11 || this.player.frame === 17) {
            if (this.punchSFX.isPlaying === false) {
                this.punchSFX.play("", 0, 0.5);
            }

        }
        this.cursors = this.input.keyboard.createCursorKeys();
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        if (this.player.life === true) {
            if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {

                if (this.turnLeft === true) {
                    this.player.play('attackLeft');
                }
                else {
                    this.player.play('attackRight');
                }
            }
            else if(this.input.keyboard.isDown(Phaser.Keyboard.F)){
                this.fireEnergyBall();
            }
            else {
                if (this.player.animationInstance1.isPlaying === false && this.player.animationInstance2.isPlaying === false && this.player.animationInstance3.isPlaying === false && this.player.animationInstance4.isPlaying === false) {
                    if (this.cursors.left.isDown) {
                        this.turnLeft = true;
                        this.player.play('walkLeft');
                        this.player.body.velocity.x = -this.player.speed;
                    } else if (this.cursors.right.isDown) {
                        this.turnLeft = false;
                        this.player.play('walkRight');
                        this.player.body.velocity.x = this.player.speed;
                    }

                    else if (this.cursors.up.isDown) {
                        if (this.turnLeft === true) {
                            this.player.play('walkLeft');
                        }
                        else {
                            this.player.play('walkRight');
                        }
                        this.player.body.velocity.y = -this.player.speed;

                    } else if (this.cursors.down.isDown) {
                        if (this.turnLeft === true) {
                            this.player.play('walkLeft');
                        }
                        else {
                            this.player.play('walkRight');
                        }
                        this.player.body.velocity.y = this.player.speed;
                    }
                    else {
                        if (this.turnLeft === true) {
                            this.player.play('idleLeft');
                        }
                        else {
                            this.player.play('idleRight');
                        }
                    }
                }
            }
        }
    },

    setupEnemies: function () {

        this.bruteGroup = this.add.group();
        this.bruteGroup.enableBody = true;
        this.bruteGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bruteGroup.createMultiple(50, 'Enemy');
        this.bruteGroup.setAll('anchor.x', 0.5);
        this.bruteGroup.setAll('anchor.y', 0.5);
        this.bruteGroup.setAll('checkWorldBounds', true);
        this.bruteGroup.setAll('immovable', false);
        this.bruteGroup.setAll('dropRate', 0.5, false, false, 0, true);
        this.bruteGroup.setAll('reward', 100, false, false, 0, true);
        this.bruteGroup.forEach(function (enemy) {

            enemy.body.setSize(60, 110);
            enemy.scale.setTo(2, 2);
            enemy.animations.add('walkLeft', [0, 1, 2, 3, 4, 5], 10, false);
            enemy.animations.add('walkRight', [7, 8, 9, 10, 11, 12], 10, false);
            enemy.animationReference1 = enemy.animations.add('attackRight', [14, 15, 16, 17, 18, 19, 20, 7], 10, false);
            enemy.animationReference2 = enemy.animations.add('attackLeft', [21, 22, 23, 24, 25, 26, 27, 0], 10, false);
            enemy.animationReference3 = enemy.animations.add('hitLeft', [28, 29], 10, false);
            enemy.animationReference4 = enemy.animations.add('hitRight', [35, 36], 10, false);
            enemy.animations.add('dieLeft', [28, 29, 30, 31, 32, 33, 34], 10, false);
            enemy.animations.add('dieRight', [35, 36, 37, 38, 39, 40, 41], 10, false);
            enemy.attackDelay = 2000;
            enemy.nextAttack = 0;
            enemy.health = 3;
            enemy.invul = 500;
            enemy.invulUntil = 0;
            enemy.life = true;
            enemy.deathTime = 0;
        });


        this.nextEnemyAt = 0;
        this.enemyDelay = 5000;

    },

    moveBrute: function (brute) {
        this.game.physics.arcade.moveToObject(brute, this.player, 50);
    },

    bruteAI: function () {
        this.bruteGroup.forEachAlive(function (brute) {
            this.game.debug.body(brute);
            if (brute.life === true) {
                if (Phaser.Point.distance(this.player.position, brute.position) > 50 && brute.animationReference1.isPlaying === false && brute.animationReference2.isPlaying === false && brute.animationReference3.isPlaying === false && brute.animationReference4.isPlaying === false) {
                    if (this.player.position.x - brute.position.x < 0) {
                        brute.play('walkLeft');
                        this.moveBrute(brute);
                    }
                    else {
                        brute.play('walkRight');
                        this.moveBrute(brute);
                    }
                }
                else {
                    brute.body.velocity.x = 0;
                    brute.body.velocity.y = 0;
                    if (this.time.now > brute.nextAttack) {
                        if (this.player.position.x - brute.position.x < 0) {
                            brute.play('attackLeft');
                            brute.nextAttack = this.time.now + brute.attackDelay;
                        }
                        else {
                            brute.play('attackRight');
                            brute.nextAttack = this.time.now + brute.attackDelay;
                        }
                    }
                }
            }
            else {
                //DO DEATH SHIT
                if (brute.deathTime < this.time.now) {
                    brute.destroy();
                }
            }
        }, this);
    },


    EnemyHit: function (player, enemy) {
        if (player.frame === 11 || player.frame === 17) {
            //this.displayDialogue();
            this.enemyTakeDamage(enemy, 1);



        }
        if (enemy.frame === 16 || enemy.frame === 23) {
            this.playerTakeDamage(10);

        }
    },

    playerTakeDamage: function (damage) {
        if (this.player.invulTill > this.time.now) {
            return;
        }
        if (this.player.health === 10) {
            if (this.player.life === true) {
                this.player.play('dieLeft');
                this.player.life = false;
                return;
            }
            return;
        }
        else {
            this.player.damage(damage);
            tween.start();
        }
        if (this.player.alive) {
            if (this.playerHitSFX.isPlaying === false) {
                this.playerHitSFX.play("", 0, 0.5);
            }
            if (this.turnLeft === true) {
                this.player.play('hitLeft');
            }
            else {
                this.player.play('hitRight');
            }
            this.player.invulTill = this.time.now + 1000;
        }



    },

    enemyTakeDamage: function (enemy, damage) {
        if (enemy.invulUntil > this.time.now) {
            return;
        }
        if (damage >= enemy.health) {
            this.spawnHealthDrop(enemy);
            this.addToScore(enemy.reward);
            if (this.enemyDieSFX.isPlaying === false) {
                this.enemyDieSFX.play();
            }
            if (this.player.position.x - enemy.position.x < 0) {
                enemy.play('dieRight');
            }
            else {
                enemy.play('dieLeft');
            }
            enemy.life = false;
            enemy.body = null;
            enemy.deathTime = this.time.now + 5000;
        }
        else {
            if (this.hitSFX.isPlaying === false) {
                this.hitSFX.play("", 0, 0.3);
            }
            enemy.damage(damage);
            enemy.invulUntil = this.time.now + 300;
            if (this.player.position.x - enemy.position.x < 0) {
                enemy.play('hitRight');
            }
            else {
                enemy.play('hitLeft');
            }
        }
    },
    setUpMap: function () {

        this.map = this.game.add.tilemap('hallwayMap');
        this.map.addTilesetImage('ClassRoom', 'schoolTiles');
        this.map.addTilesetImage('OutSide', 'outsideTiles');
        this.backgroundlayer = this.map.createLayer('BG');
        this.backgroundlayer = this.map.createLayer('Flowers');
        this.blockedLayer = this.map.createLayer('Blocking');
        this.itemlayer = this.map.createLayer('Items');



        //Setting collisions


        this.map.setCollisionBetween(1, 2000, true, 'Blocking');
        this.game.debug.body(this.blockedLayer);
        this.backgroundlayer.resizeWorld();
        //this.game.physics.arcade.enablet(this.map);
        //this.game.physics.setBoundsToWorld();
    },
    healthbar: function () {
        tween = this.add.tween(this.cropRect).to({ width: this.player.health - 20 }, 3000, Phaser.Easing.Linear.Out, false, 0, 0, false);
        this.hpbar.crop(this.cropRect);
    },

    setUpHealthDrops: function () {
        this.healthPool = this.add.group();
        this.healthPool.enableBody = true;
        this.healthPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.healthPool.createMultiple(5, 'healthPickUp');
        this.healthPool.setAll('anchor.x', 0.5);
        this.healthPool.setAll('anchor.y', 0.5);
        this.healthPool.setAll('outOfBoundsKill', true);
        this.healthPool.setAll('checkWorldBounds', true);


    },

    spawnHealthDrop: function (enemy) {
        if (this.healthPool.countDead() === 0 || this.player.health >= 110) {
            return;
        }
        if (this.rnd.frac() < enemy.dropRate) {
            var healthDrop = this.healthPool.getFirstExists(false);
            healthDrop.reset(enemy.x, enemy.y + 20);

        }
    },

    playerHealthUp: function (player, healthUp) {
        if (this.player.health > 110) {
            return;
        }
        this.player.health = this.player.health + 20;
        if (this.player.health > 110) {
            this.player.health = 110;

        }

        healthUp.kill();
        tween.start();
    },

    setUpText: function(){
        this.instructions = this.add.text(200, 600,
            'Use Arrow Keys to move the player\n' +
            'Space to Punch',
            { font: '20px monospace', fill: '#fff', allign: 'center' }
            );

        this.instructions.anchor.setTo(0.5, 0.5);
        this.instExpire = this.time.now + 10000;
        
        this.score = 0;
        this.scoreText = this.add.text(800, 600,
            ' ' + this.score,
            { font: '20px monospace', fill: '#fff', allign: 'center' }
            );
        this.scoreText.anchor.setTo(0.5, 0.5);
    },

    addToScore: function (score) {
         this.score += score;
         this.scoreText.text = this.score;
         },

}