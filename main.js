// First, add the dialogue data as a constant
const DIALOGUE_DATA = {
    "npc1": {
        "greeting": "Yooooo what's up Taylor, it's me Adnan!!",
        "chat": [
            "I'm thinking we put some shit on that table over there...Maybe some old projects",
            "I haven't blinked in 4 hours."
        ]
    },
    "npc2": {
        "greeting": "Hey Taylor, it's me...also Taylor.",
        "chat": [
            "You're playing as our potential client.",
            "It's fun to play with yourself!"
        ]
    },
    "tableObject": {
        "greeting": "The Fairweather Hat!",
        "chat": [
            "Leading up to the final games of the World Series of baseball, we teamed up with...",
            "Pablo Rochat and Brian Moore to build a cap that helps you root for the winning team...",
            "whichever that may be."
        ]
    }
};

let player;
let cursors;
let spaceKey;
let npc1, npc2;
let tableObject;
let arcade;
let puffle;

let dialogueBox;
let dialogueText;
let isDialogueActive = false;
let canTalkToNpc1 = false;
let canTalkToNpc2 = false;
let lastDirection = 'south'; // Track player's facing direction
let currentDialogue = '';
let targetDialogue =  '';
let charIndex = 0;
let textSpeed = 20; // milliseconds per character
let lastCharTime = 0;
let dialogueData;
let currentNPC = null;
let currentDialogueIndex = 0;
let bgMusic;

let isInteractingWithPuffle = false;

let url;
let url2;
let joystick;
let button;

let buttonPressed;

var snake;
var food;

//  Direction consts
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

class Main extends Phaser.Scene {
    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('movement', 'https://raw.githubusercontent.com/adnanaga/spak-pokemon/refs/heads/main/assets/movement.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('npc', 'https://raw.githubusercontent.com/adnanaga/spak-pokemon/refs/heads/main/assets/npc.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('penguin', 'assets/penguin.png', { frameWidth:512, frameHeight: 512 });
        this.load.audio('bgMusic', 'https://raw.githubusercontent.com/adnanaga/spak-pokemon/refs/heads/main/assets/music.mp3');
      
        url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);
    
        url2 = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js';
        this.load.plugin('rexbuttonplugin', url2, true);
    }
    
    create() {
        // Add background
        let bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        bg.setScale(4);
    
        // Create player sprite and enable physics
        player = this.physics.add.sprite(config.width / 2, config.height / 2, 'movement');
        player.setScale(4);
        player.setDepth(1); // Set player to be above other objects
    
        // Create animations for left, back, front, and right, using single frames from the movement spritesheet
        this.anims.create({
            key: 'face_west',
            frames: [{ key: 'movement', frame: 8 }],
            frameRate: 1
        });
    
        this.anims.create({
            key: 'face_north',
            frames: [{ key: 'movement', frame: 0 }],
            frameRate: 1
        });
    
        this.anims.create({
            key: 'face_south',
            frames: [{ key: 'movement', frame: 4 }],
            frameRate: 1
        });
    
        this.anims.create({
            key: 'face_east',
            frames: [{ key: 'movement', frame: 12 }],
            frameRate: 1
        });
    
        // Create animations for the player
        this.anims.create({
            key: 'walk_north',
            frames: this.anims.generateFrameNumbers('movement', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'walk_south',
            frames: this.anims.generateFrameNumbers('movement', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'walk_left',
            frames: this.anims.generateFrameNumbers('movement', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'walk_right',
            frames: this.anims.generateFrameNumbers('movement', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
    
        // Assuming 'penguin-walk' animation is already created as you have done
        this.anims.create({
            key: 'penguin-walk',
            frames: this.anims.generateFrameNumbers('penguin', { start: 0, end: 106 }),
            frameRate: 14,
            repeat: -1,
        });
    
        // Create boundary walls using rectangles
        let wallTop = this.add.rectangle(288, 10, 576, 20, 0x000000, 0);
        this.physics.add.existing(wallTop, true);
    
        let wallBottom = this.add.rectangle(288, 510, 576, 20, 0x000000, 0);
        this.physics.add.existing(wallBottom, true);
    
        let wallLeft = this.add.rectangle(10, 260, 20, 520, 0x000000, 0);
        this.physics.add.existing(wallLeft, true);
    
        let wallRight = this.add.rectangle(566, 260, 20, 520, 0x000000, 0);
        this.physics.add.existing(wallRight, true);
    
        // Define walls using rectangles with half opacity
        let wall1 = this.add.rectangle(20, 20, 210, 90, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(wall1, true);
    
        let wall2 = this.add.rectangle(348, 20, 210, 95, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(wall2, true);
    
        let wall3 = this.add.rectangle(20, 345, 95, 80, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(wall3, true);
    
        let wall4 = this.add.rectangle(348, 345, 210, 70, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(wall4, true);
    
        let table = this.add.rectangle(348, 175, 170, 40, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(table, true);
    
        tableObject = this.add.rectangle(410, 180, 50, 50, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(tableObject, true);
    
        arcade = this.add.rectangle(120, 345, 50, 80, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(arcade, true);
    
        puffle = this.add.rectangle(515, 465, 50, 50, 0x000000, 0).setOrigin(0, 0);
        this.physics.add.existing(puffle, true);
    
        // Add colliders for the boundary walls
        this.physics.add.collider(player, wallTop);
        this.physics.add.collider(player, wallBottom);
        this.physics.add.collider(player, wallLeft);
        this.physics.add.collider(player, wallRight);
    
        // Set up colliders for walls
        this.physics.add.collider(player, wall1);
        this.physics.add.collider(player, wall2);
        this.physics.add.collider(player, wall3);
        this.physics.add.collider(player, wall4);
    
        this.physics.add.collider(player, table);
        this.physics.add.collider(player, arcade);
    
        this.physics.add.collider(player, puffle);
    
        // Create NPCs with physics bodies
        npc1 = this.physics.add.sprite(260, 100, 'npc');
        npc2 = this.physics.add.sprite(315, 100, 'npc');
    
        // Create simple 2 frame animations for NPCs
        this.anims.create({
            key: 'npc1_anim',
            frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
    
        this.anims.create({
            key: 'npc2_anim',
            frames: this.anims.generateFrameNumbers('npc', { start: 3, end: 2 }),
            frameRate: 2,
            repeat: -1
        });
    
        npc1.play('npc1_anim');
        npc2.play('npc2_anim');
        npc1.setScale(4);
        npc2.setScale(4);
        npc1.setDepth(0);
        npc2.setDepth(0);
        
        // Make NPCs immovable
        npc1.setImmovable(true);
        npc2.setImmovable(true);
        
        // Add colliders for NPCs
        this.physics.add.collider(player, npc1);
        this.physics.add.collider(player, npc2);
        this.physics.add.collider(player, npc2);
    
        // Create cursor keys for movement
        cursors = this.input.keyboard.createCursorKeys();

         // Handle key input
         this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'ArrowUp') {
            }
            // Handle other keys if needed
        });

        // Listen for when the scene is resumed
        this.events.on('resume', () => {
            // Reinitialize input if necessary
            cursors = this.input.keyboard.createCursorKeys();
        });

        // Create dialogue box
        dialogueBox = this.add.graphics();
        dialogueBox.fillStyle(0xFFFFFF, 1);  // White background
        dialogueBox.lineStyle(4, 0x000000, 1);  // Black border
        dialogueBox.fillRoundedRect(50, 420, 480, 80, 10);  // Rounded rectangle with 10px radius
        dialogueBox.strokeRoundedRect(50, 420, 480, 80, 10);  // Rounded border with 10px radius
        dialogueBox.setScrollFactor(0);  // Fix to camera
        dialogueBox.setDepth(2);  // Ensure it's above other elements
        dialogueBox.setVisible(false);  // Hide initially
    
        // Create dialogue text
        dialogueText = this.add.text(65, 430, '', {
            font: '21px Helvetica',
            fill: '#000000',  // Black text
            wordWrap: { width: 440 }
        });
    
        dialogueText.setScrollFactor(0);  // Fix to camera
        dialogueText.setDepth(2);
        dialogueText.setVisible(false);  // Hide initially
    
        // Add space key input
        spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        dialogueData = DIALOGUE_DATA;
    
        // Add this inside the create function
        bgMusic = this.sound.add('bgMusic', {
            volume: 0.1,
            loop: true
        });
        bgMusic.play();
    
        const muteKey = this.input.keyboard.addKey('M');
        muteKey.on('down', function() {
        if (bgMusic.isPlaying) {
            bgMusic.pause();
        } else {
            bgMusic.resume();
        }
    });
    
    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
        const margin = 40;
        const buttonSize = 50;
        const joystickRadius = 100;
    
        // Joystick (bottom-left with fixed margin)
        joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: joystickRadius + margin,
            y: config.height - joystickRadius - margin,
            radius: joystickRadius,
            base: this.add.circle(0, 0, joystickRadius, 0x888888),
            thumb: this.add.circle(0, 0, joystickRadius / 2, 0xcccccc),
        });
    
        // Button (bottom-right with fixed margin)
        button = this.add.circle(
            config.width - buttonSize - joystickRadius/2 - margin,
            config.height - joystickRadius - margin,
            buttonSize,
            0xff0000
        )
        .setInteractive()
        .on('pointerdown', () => {
            button.setFillStyle(0x880000);
            buttonPressed = true;
        })
        .on('pointerup', () => {
            button.setFillStyle(0xff0000);
            buttonPressed = false;
        })
        .on('pointerout', () => {
            button.setFillStyle(0xff0000);
            buttonPressed = false;
        });
        }
    
            // Merge joystick directions into `cursors`
        if (joystick) {
            const joyCursors = joystick.createCursorKeys();
            cursors = {
                up: joyCursors.up || cursors.up,
                down: joyCursors.down || cursors.down,
                left: joyCursors.left || cursors.left,
                right: joyCursors.right || cursors.right
            };
                
        }
    }
    
    update(time, delta) {
    
        if (!isDialogueActive) {
            const prevVelocity = player.body.velocity.clone();
            
            // Stop any previous movement from the last frame
            player.body.setVelocity(0);
    
        // Store movement inputs from joystick and cursors
        const leftKeyDown = cursors.left && cursors.left.isDown;
        const rightKeyDown = cursors.right && cursors.right.isDown;
        const upKeyDown = cursors.up && cursors.up.isDown;
        const downKeyDown = cursors.down && cursors.down.isDown;
    
        const speed = 150;
        player.setVelocity(0);
        // Handle movement with priority for left/right animations
        if (leftKeyDown || cursors.left.isDown) {
            isInteractingWithPuffle = false;
            player.setScale(4)
            player.setVelocityX(-speed);
            player.anims.play('walk_left', true);
        } else if (rightKeyDown || cursors.right.isDown) {
            isInteractingWithPuffle = false;
            player.setScale(4)
            player.setVelocityX(speed);
            player.anims.play('walk_right', true);
        } else if (upKeyDown || cursors.up.isDown) {
            isInteractingWithPuffle = false;
            player.setScale(4)
            player.setVelocityY(-speed);
            player.anims.play('walk_north', true);
        } else if (downKeyDown || cursors.down.isDown) {
            isInteractingWithPuffle = false;
            player.setScale(4)
            player.setVelocityY(speed);
            player.anims.play('walk_south', true);
        } else {
            if (isInteractingWithPuffle) {
                player.anims.play('penguin-walk', true);  // Keep playing penguin-walk
            } else {
            player.anims.stop();
            if (prevVelocity.x < 0) player.anims.play('face_west', true);
                else if (prevVelocity.x > 0) player.anims.play('face_east', true);
                else if (prevVelocity.y < 0) player.anims.play('face_north', true);
                else if (prevVelocity.y > 0) player.anims.play('face_south', true);
            }
        }
    
        // Prevent faster diagonal movement
        player.body.velocity.normalize().scale(speed);
    
        if (Phaser.Input.Keyboard.JustDown(spaceKey) || buttonPressed) {
    
            if (this.canInteractWithNPC(player, npc1)) {
                this.startDialogue('npc1');
            } else if (this.canInteractWithNPC(player, npc2)) {
                this.startDialogue('npc2');
            } else if (tableObject && this.canInteractWithNPC(player, tableObject)) {
                this.startDialogue('tableObject');
            } else if (arcade && this.canInteractWithNPC(player, arcade)) {
                console.log("Arcade interaction!");
                // Pause the Snake scene
                this.scene.pause('main');
                this.scene.launch('snake');
            } else if (this.canInteractWithNPC(player, puffle)) {
                console.log("puffle interaction!");
                // Start the penguin walk animation and set the interaction flag
                isInteractingWithPuffle = true;
                player.setScale(0.25);
        
                // Revert after 5 seconds
                this.time.delayedCall(10000, function() {
                    // After 5 seconds, stop the interaction and reset
                    isInteractingWithPuffle = false;
                    player.anims.stop();
                    player.setScale(4);
                    player.anims.play('face_south', true); // Default animation (you can change this)
                });
            }
            buttonPressed = false; // Reset mobile button state
        }
    
        } else {
            // Stop player movement when dialogue is active
            player.anims.stop();
            player.body.setVelocity(0);
            
            // Handle typing effect
            if (time > lastCharTime + textSpeed && charIndex < targetDialogue.length) {
                currentDialogue += targetDialogue.charAt(charIndex);
                dialogueText.setText(currentDialogue);
                charIndex++;
                lastCharTime = time;
            }
            
            // Update loop: Handle space or button press for dialogue
            if (Phaser.Input.Keyboard.JustDown(spaceKey) || buttonPressed) {
                if (charIndex < targetDialogue.length) {
                    currentDialogue = targetDialogue;
                    dialogueText.setText(currentDialogue);
                    charIndex = targetDialogue.length;
                } else {
                    this.advanceDialogue();
                }
                buttonPressed = false;
            }
        }
    }
    
    startDialogue(npcId) {
        currentNPC = npcId;
        currentDialogueIndex = 0;
        isDialogueActive = true;
        dialogueBox.setVisible(true);
        dialogueText.setVisible(true);
        
        // Show greeting first
        targetDialogue = dialogueData[npcId].greeting;
        currentDialogue = '';
        charIndex = 0;
        lastCharTime = 0;
    }
    
    advanceDialogue() {
        if (!currentNPC) {
            this.hideDialogue();
            return;
        }
    
        const npcDialogue = dialogueData[currentNPC].chat;
        
        if (currentDialogueIndex < npcDialogue.length) {
            // Show next dialogue line
            targetDialogue = npcDialogue[currentDialogueIndex];
            currentDialogue = '';
            charIndex = 0;
            lastCharTime = 0;
            currentDialogueIndex++;
        } else {
            // End of dialogue
            this.hideDialogue();
            currentNPC = null;
            currentDialogueIndex = 0;
        }
    }
    
    hideDialogue() {
        isDialogueActive = false;
        dialogueBox.setVisible(false);
        dialogueText.setVisible(false);
        currentDialogue = '';
        targetDialogue = '';
        charIndex = 0;
        currentNPC = null;
        currentDialogueIndex = 0;
    }
    
    canInteractWithNPC(player, object) {
        // Get the direction vector from player to NPC
        const dx = object.x - player.x;
        const dy = object.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);    
           // Check if the object has a valid 'geom' property and 'height'
           if (object.geom && object.geom.height == 80) {

            if(player.x > 120 && player.x < 168 && player.y > 455 && player.y <470){
                if (distance < 120) {
                    return true;
                    }
            }

            }
    
        if (distance < 80) {
            return true;
        }
        return false;
    }
    
}

class Snake extends Phaser.Scene {

    preload () {

        this.load.image('snakeBackground', 'assets/snakeBackground.png');

        this.load.image('food', 'assets/nike.png');
        this.load.image('spakLogo', 'assets/exclamation.png'); // Full SPAK logo
        this.load.image('logo', 'assets/exclamation.png');   // Exclamation mark
        
    }

    create() {
    //     this.cameras.main.setBackgroundColor("#95C413"); // Set background color
    this.add.image(0, 0, 'snakeBackground').setOrigin(0, 0).setScale(1); // Adjust the scale if needed

        // Create a graphics object to draw the box
        this.graphics = this.add.graphics({ lineStyle: { width: 4, color: 0x000000 } });

        // Box dimensions (adjust as needed)
        const boxWidth = 576-40;
        const boxHeight = 520 - 110;

        // Position the box in the center of the game world
        const boxX = (this.cameras.main.width - boxWidth) / 2;
        const boxY = (this.cameras.main.height - boxHeight) / 2 + 35;

        // Draw the box on the graphics object
        this.graphics.strokeRect(boxX, boxY, boxWidth, boxHeight);

        this.cameras.main.setBounds(0, 0, boxWidth, boxHeight); // Set the camera bounds to match the world size
        this.cameras.main.centerOn(boxWidth / 2, boxHeight / 2); // Center the camera in the middle of the world

        // Add the score at the top-left corner with a line underneath
        this.score = 0;  // Initialize the score
        this.scoreText = this.add.text(20, 20, `${this.score}`, {
            fontSize: '48px',
            fill: '#000000',
            fontFamily: 'Courier New'
        });

        // Draw the line under the score
        this.graphics.lineStyle(4, 0x000000); // White line under the score
        this.graphics.moveTo(20, 70);  // Start position of the line
        this.graphics.lineTo(boxX+boxWidth, 70 );  // End position of the line
        this.graphics.strokePath();

        // Update the score text whenever it changes
        this.scoreText.setText(`${this.score}`);

        this.input.keyboard.on('keydown-ESC', () => {
            
            // Pause the Snake scene
            this.scene.pause('snake');
            
            // Optionally, hide Snake scene's visuals (helps prevent it from being shown frozen)
            this.scene.setVisible(false, 'snake');

            // Resume the Main scene
            this.scene.resume('main');
        });


        var Food = new Phaser.Class({

            Extends: Phaser.GameObjects.Image,

            initialize:

            function Food (scene, x, y)
            {
                Phaser.GameObjects.Image.call(this, scene)

                this.setTexture('food');
                this.setPosition(x * 32*2, y * 32*3);
                this.setOrigin(0);
                this.setScale(0.1);
                this.setSize(this.width, this.height);

                // Create the graphics object for the hitbox
        // this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });
        // this.drawHitbox();

                this.total = 0;

                scene.children.add(this);
            },

            eat: function ()
            {
                this.total++;
            },

            // Function to draw the hitbox (red rectangle around the food)
        // Function to draw the hitbox (red rectangle around the food)
        drawHitbox: function () {
            this.graphics.clear(); // Clear previous drawings
    
            // Update the hitbox size based on the scaled dimensions
            const scaledWidth = this.width * this.scaleX; 
            const scaledHeight = this.height * this.scaleY;
    
            // Draw a red rectangle around the food with the updated scaled size
            this.graphics.strokeRect(this.x, this.y, scaledWidth, scaledHeight);
        },

        // Destroy food
    destroyFood: function() {
        this.destroy();  // Destroy the food object
        this.graphics.clear();  // Clear the hitbox graphics
    },

        });

        var Snake = new Phaser.Class({
            initialize:
            function Snake (scene, x, y, scoreText, food) {
                this.headPosition = new Phaser.Geom.Point(x, y);
                this.body = scene.add.group();
    
                // Create the head using the SPAK logo
                this.head = this.body.create(x * 16, y * 16, 'spakLogo');
                this.head.setScale(0.25); // Adjust scale for visibility
                this.head.setOrigin(0);
    
                this.alive = true;
                this.speed = 150;
                this.moveTime = 0;
                this.tail = new Phaser.Geom.Point(x, y);
                this.heading = RIGHT;
                this.direction = RIGHT;

                this.score = 0;
                this.scoreText = scoreText; // Store scoreText reference

                this.food = food;  // Store reference to the food

                        // Create the graphics object for the hitbox
        // this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });
        // this.drawHitbox(); // Draw the initial hitbox
            },

            update: function (time)
            {
                if (time >= this.moveTime)
                {
                    return this.move(time);
                }

                 // Update the hitbox when the snake moves or when any changes occur
        // this.drawHitbox();
            },

            // Function to draw the hitbox (red rectangle around the snake head)
    drawHitbox: function() {
        this.graphics.clear(); // Clear previous drawings

        // Update the hitbox size based on the scaled dimensions of the head
        const scaledWidth = this.head.width * this.head.scaleX;
        const scaledHeight = this.head.height * this.head.scaleY;

        // Draw a red rectangle around the snake head with the updated scaled size
        this.graphics.strokeRect(this.head.x, this.head.y, scaledWidth, scaledHeight);
    },

            faceLeft: function ()
            {
                if (this.direction === UP || this.direction === DOWN)
                {
                    this.heading = LEFT;
                }
            },

            faceRight: function ()
            {
                if (this.direction === UP || this.direction === DOWN)
                {
                    this.heading = RIGHT;
                }
            },

            faceUp: function ()
            {
                if (this.direction === LEFT || this.direction === RIGHT)
                {
                    this.heading = UP;
                }
            },

            faceDown: function ()
            {
                if (this.direction === LEFT || this.direction === RIGHT)
                {
                    this.heading = DOWN;
                }
            },

            move: function (time)
            {
                const GRID_WIDTH = 35;  // New width for the grid
                const GRID_HEIGHT = 31; // New height for the grid

                    // Check for collisions with the grid boundary (ensures snake dies if out of bounds)
    if (this.headPosition.x <= 1 || this.headPosition.x >= GRID_WIDTH-1 || this.headPosition.y <= 5 || this.headPosition.y >= GRID_HEIGHT-1) {
        console.log('dead: out of bounds');
        this.alive = false;

                // Manually clear the body group
        this.body.clear(true, true); // Clear all children and destroy them

        
                // Destroy the head if it's not part of the body group
                if (this.head) {
                    this.head.destroy();  // Destroy the head object
                }

                console.log(this.body.getChildren()); // Check the body parts in the group

        // If you have a food object, destroy it here as well
        if (this.food) {
            this.food.destroy();  // Destroy the food object
        }

        // Optionally reset the score or any other game state (you can clear score text if needed)
        this.scoreText.setText("GAME OVER :("); // Example: Updating score text on game over

        return false; // Stop the movement, end the game or trigger reset
    }

                /**
                * Based on the heading property (which is the direction the pgroup pressed)
                * we update the headPosition value accordingly.
                * 
                * The Math.wrap call allow the snake to wrap around the screen, so when
                * it goes off any of the sides it re-appears on the other.
                */
                switch (this.heading) {
                    case LEFT:
                        // Set the custom left boundary (e.g., 5 instead of 0)
                        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, GRID_WIDTH);
                        break;
                
                    case RIGHT:
                        this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, GRID_WIDTH);
                        break;
                
                    case UP:
                        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 5, GRID_HEIGHT);
                        break;
                
                    case DOWN:
                        this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, GRID_HEIGHT);
                        break;
                }

                this.direction = this.heading;

                //  Update the body segments and place the last coordinate into this.tail
                Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

                //  Check to see if any of the body pieces have the same x/y as the head
                //  If they do, the head ran into the body

                var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

                if (hitBody)
                {
                    console.log('dead');

                    this.alive = false;

                    return false;
                }
                else
                {
                    //  Update the timer ready for the next movement
                    this.moveTime = time + this.speed;

                    return true;
                }
            },

            grow: function ()
            {
                var newPart = this.body.create(this.tail.x, this.tail.y, 'logo');
                newPart.setScale(0.25);
                newPart.setOrigin(0);

                // Adjust the hitbox size based on the scale
                newPart.setSize(newPart.width * newPart.scaleX, newPart.height * newPart.scaleY);
                this.score += 1;
                console.log(this.score)
                // Update the score text to reflect the new score
                this.scoreText.setText(`${this.score}`);
            },

            collideWithFood: function (food)
{
    // Create rectangles for the snake head and the food based on their positions and sizes
    let headBounds = new Phaser.Geom.Rectangle(this.head.x, this.head.y, this.head.width * this.head.scaleX, this.head.height * this.head.scaleY);
    let foodBounds = new Phaser.Geom.Rectangle(food.x, food.y, food.width * food.scaleX, food.height * food.scaleY);

    // Check for overlap between the snake's head and the food's hitbox
    if (Phaser.Geom.Rectangle.Overlaps(headBounds, foodBounds))
    {
        this.grow();

        food.eat();

        // For every 5 items of food eaten, we'll increase the snake speed a little
        if (this.speed > 20 && food.total % 5 === 0)
        {
            this.speed -= 5;
        }

        return true;
    }
    else
    {
        return false;
    }
},

            updateGrid: function (grid)
            {
                //  Remove all body pieces from valid positions list
                this.body.children.each(function (segment) {

                    var bx = segment.x / 16;
                    var by = segment.y / 16;

                    grid[by][bx] = false;

                });

                return grid;
            }

        });

        food = new Food(this, 3, 4);

        snake = new Snake(this, 8, 8, this.scoreText, food);

        //  Create our keyboard controls
        cursors = this.input.keyboard.createCursorKeys();
    }

    update (time, delta) {
        if (!snake.alive)
        {
            return;
        }

        /**
        * Check which key is pressed, and then change the direction the snake
        * is heading based on that. The checks ensure you don't double-back
        * on yourself, for example if you're moving to the right and you press
        * the LEFT cursor, it ignores it, because the only valid directions you
        * can move in at that time is up and down.
        */
        if (cursors.left.isDown)
        {
            snake.faceLeft();
        }
        else if (cursors.right.isDown)
        {
            snake.faceRight();
        }
        else if (cursors.up.isDown)
        {
            snake.faceUp();
        }
        else if (cursors.down.isDown)
        {
            snake.faceDown();
        }

        if (snake.update(time))
        {
            //  If the snake updated, we need to check for collision against food

            if (snake.collideWithFood(food))
            {
                this.repositionFood();
            }
        }
    }

    repositionFood () {
        const GRID_WIDTH = 35;   // New width for the grid
        const GRID_HEIGHT = 27;  // New height for the grid
    
        // Create a grid to track available spaces
        var testGrid = [];
        for (var y = 0; y < GRID_HEIGHT; y++) {
            testGrid[y] = [];
            for (var x = 0; x < GRID_WIDTH; x++) {
                testGrid[y][x] = true;
            }
        }
    
        // Update the grid based on snake's position
        snake.updateGrid(testGrid);
    
        // Find valid locations for the food
        var validLocations = [];
        for (var y = 0; y < GRID_HEIGHT; y++) {
            for (var x = 0; x < GRID_WIDTH; x++) {
                // Ensure the food is within the valid bounds (avoid snake's body and outside bounds)
                if (testGrid[y][x] === true && x >= 3 && x < GRID_WIDTH - 3 && y >= 8 && y < GRID_HEIGHT - 1) {
                    validLocations.push({ x: x, y: y });
                }
            }
        }
    
        // If there are valid locations, place the food in one of them
        if (validLocations.length > 0) {
            var pos = Phaser.Math.RND.pick(validLocations);
            food.setPosition(pos.x * 16, pos.y * 16); // Adjust for grid cell size
            return true;
        } else {
            return false;
        }
    }
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
    // Then add your main.js code, but modify the dialogue loading to use the constant
    config = {
        key:"main",
        type: Phaser.AUTO,
        width: 576,
        height: 800,
        pixelArt: true,
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: true
            }
        },
        scale: {
            parent: 'parent',
            mode: Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_HORIZONTALLY
        },
    };
}

 else {
    config = {
        key:"main",
        type: Phaser.AUTO,
        width: 576,
        height: 520,
        pixelArt: true,
        scene: [
            new Main("main"),
            new Snake("snake")],
            //     scene: [
            // new Snake("snake")],
        physics: {
            default: 'arcade',
            arcade: {
                debug: true
            }
        },
        scale: {
            parent: 'parent',
            mode: Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_BOTH
        },
    };
 }

const game = new Phaser.Game(config);