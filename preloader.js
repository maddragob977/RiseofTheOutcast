
BasicGame.Preloader = function (game) {

  this.background = null;
  this.preloadBar = null;
 
  //this.ready = false;

};

BasicGame.Preloader.prototype = {

  preload: function () {

    //  Show the loading progress bar asset we loaded in boot.js
    this.stage.backgroundColor = '#2d2d2d';
    this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
    this.add.text(this.game.width / 2, this.game.height / 2 - 30, "Loading...", { font: "32px monospace", fill: "#fff" }).anchor.setTo(0.5, 0.5);
    this.load.tilemap('classroomMap', 'assets/json/Classroom.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('schoolTiles','assets/ClassRoom.png');
    this.load.image('outsideTiles','assets/OutSide.png');
    //this.load.image('DialogueBox','assets/DialogueBoxBG.png');
    this.load.image('healthPickUp','assets/food.png');
    
    this.load.tilemap('hallwayMap','assets/json/Hallway.json',null,Phaser.Tilemap.TILED_JSON);
   
    this.load.spritesheet('Player','assets/Boy.png',45,50);
    this.load.spritesheet('Enemy','assets/EnemySS.png',65,60);
    this.load.spritesheet('hpbar','assets/Hp.png',100,10);
    this.load.spritesheet('energyBall','assets/energyBall1.png',70,45)
    
    //Load Audio
    this.load.audio('grunt',['assets/audio/grunt.wav']);
    this.load.audio('punch',['assets/audio/punch.wav']);
    this.load.audio('hit',['assets/audio/hit.wav']);
    this.load.audio('bgm',['assets/audio/DST-Aurora.mp3']);
    this.load.audio('playerHit',['assets/audio/playerHit.wav']);
  },

  create: function () {

    //  Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
    this.preloadBar.cropEnabled = false;

  },

  update: function () {

    //  You don't actually need to do this, but I find it gives a much smoother game experience.
    //  Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
    //  You can jump right into the menu if you want and still play the music, but you'll have a few
    //  seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
    //  it's best to wait for it to decode here first, then carry on.
   
    //  If you don't have any music in your game then put the game.state.start line into the create function and delete
    //  the update function completely.
    
    //if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
    //{
    //  this.ready = true;
      this.state.start('Game');
    //}

  }

};
