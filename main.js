const config = {
    type: Phaser.AUTO,
    width: 576, // Scaled up 4x
    height: 520, // Scaled up 4x
    pixelArt: true, // Ensures crisp pixel scaling
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let spaceKey;
let npc1, npc2;
let tableObject;
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


function preload() {
    // Load assets
    this.load.image('background', 'assets/background.png'); // Background image
    this.load.spritesheet('movement', 'assets/movement.png', { frameWidth: 16, frameHeight: 16 }); // Player spritesheet
    this.load.spritesheet('npc', 'assets/npc.png', { frameWidth: 16, frameHeight: 16 }); // NPC spritesheet
    this.load.json('dialogue', 'dialogue.json');
    this.load.audio('bgMusic', 'assets/music.mp3');
}

function create() {
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

    let wall3 = this.add.rectangle(20, 345, 210, 70, 0x000000, 0).setOrigin(0, 0);
    this.physics.add.existing(wall3, true);

    let wall4 = this.add.rectangle(348, 345, 210, 70, 0x000000, 0).setOrigin(0, 0);
    this.physics.add.existing(wall4, true);

    let table = this.add.rectangle(348, 175, 170, 40, 0x000000, 0).setOrigin(0, 0);
    this.physics.add.existing(table, true);

    tableObject = this.add.rectangle(410, 180, 50, 50, 0x000000, 0).setOrigin(0, 0);
    this.physics.add.existing(tableObject, true);

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

    // Create cursor keys for movement
    cursors = this.input.keyboard.createCursorKeys();

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
    dialogueText = this.add.text(60, 430, '', {
        font: '22px Helvetica',
        fill: '#000000',  // Black text
        wordWrap: { width: 460 }
    });

    dialogueText.setScrollFactor(0);  // Fix to camera
    dialogueText.setDepth(2);
    dialogueText.setVisible(false);  // Hide initially

    // Add space key input
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    dialogueData = this.cache.json.get('dialogue');

    // Add this inside the create function
    bgMusic = this.sound.add('bgMusic', {
        volume: 0.5,
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
}

function update(time, delta) {
    if (!isDialogueActive) {
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        
        // Stop any previous movement from the last frame
        player.body.setVelocity(0);
        
        // Horizontal movement
        if (cursors.left.isDown) {
            player.body.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(speed);
        }
        
        // Vertical movement
        if (cursors.up.isDown) {
            player.body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            player.body.setVelocityY(speed);
        }
        
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        player.body.velocity.normalize().scale(speed);

        // Check for NPC interactions
        if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
            console.log(tableObject)
            if (canInteractWithNPC(player, npc1)) {
                startDialogue('npc1');
            } else if (canInteractWithNPC(player, npc2)) {
                startDialogue('npc2');
            } else if (tableObject && canInteractWithNPC(player, tableObject)) {
                startDialogue('tableObject');
            }
        }
        
        // Update the animation last and give left/right animations precedence over up/down animations
        if (cursors.left.isDown) {
            player.anims.play("walk_left", true);
        } else if (cursors.right.isDown) {
            player.anims.play("walk_right", true);
        } else if (cursors.up.isDown) {
            player.anims.play("walk_north", true);
        } else if (cursors.down.isDown) {
            player.anims.play("walk_south", true);
        } else {
            player.anims.stop();
        
            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0) player.anims.play("face_west", true);
            else if (prevVelocity.x > 0) player.anims.play("face_east", true);
            else if (prevVelocity.y < 0) player.anims.play("face_north", true);
            else if (prevVelocity.y > 0) player.anims.play("face_south", true);
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
        
        // Handle space press during dialogue
        if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
            if (charIndex < targetDialogue.length) {
                // If text is still typing, show all text immediately
                currentDialogue = targetDialogue;
                dialogueText.setText(currentDialogue);
                charIndex = targetDialogue.length;
            } else {
                advanceDialogue();
            }
        }
    }
}

function startDialogue(npcId) {
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

function advanceDialogue() {
    if (!currentNPC) {
        hideDialogue();
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
        hideDialogue();
        currentNPC = null;
        currentDialogueIndex = 0;
    }
}

function hideDialogue() {
    isDialogueActive = false;
    dialogueBox.setVisible(false);
    dialogueText.setVisible(false);
    currentDialogue = '';
    targetDialogue = '';
    charIndex = 0;
    currentNPC = null;
    currentDialogueIndex = 0;
}

function canInteractWithNPC(player, npc) {
    console.log(npc.x, npc.y, player.x, player.y);
    // Get the direction vector from player to NPC
    const dx = npc.x - player.x;
    const dy = npc.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    console.log("distance", distance);

    // Only allow interaction within 80 pixels
    if (distance < 80) {
        return true;
    }
    
    return false;
}