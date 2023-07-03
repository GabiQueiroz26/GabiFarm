import { CONFIG } from "../config";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    /** @type {Phaser.Type.Input.Keyboard.CursorKeys} */
    cursors;

    touch;

    isAction = false;

    constructor(scene, x, y, touch) {
        super(scene, x, y, 'player');

        this.touch = touch;

        scene.add.existing(this); // Criando a imagem que o jogador vê
        scene.physics.add.existing(this); // Criando o BODY da Física

        this.init();
    }

    init() {
        this.setFrame(3);

        this.speed = 120;
        this.frameRate = 8;
        this.direction = 'down';
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.setOrigin(0.5, 0.5);

        this.body.setSize(10, 10);
        this.body.setOffset(17, 20);
        this.initAnimations();

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

        this.play('idle-right');
        this.play('idle-up');
        this.play('idle-left');
        this.play('idle-down');
        this.play('walk-right');
        this.play('walk-up');
        this.play('walk-left');
        this.play('walk-down');
        this.play('cortar');
    }

    update() {
        const { left, right, down, up, space } = this.cursors;

        if(left.isDown){
            this.direction = 'left';
            this.setVelocityX(-this.speed);
        } else if (right.isDown) {
            this.direction = 'right';
            this.setVelocityX(this.speed);
        } else {
            this.setVelocityX(0);
        }

        if(up.isDown){
            this.direction = 'up';
            this.setVelocityY(-this.speed);
        } else if (down.isDown) {
            this.direction = 'down';
            this.setVelocityY(this.speed);
        } else {
            this.setVelocityY(0);
        }

        if(space.isDown) {
            this.isAction = true;
        } else {
            this.isAction = false;
        }

        if(this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.play('idle-' + this.direction, true);         
        } else {
            this.play('walk-' + this.direction, true);
        }

        //Fazer o Touch seguir o Player
        let tx, ty;
        let distance = 6;

        switch (this.direction) {
            case 'down':
                tx = 0;
                ty = distance;
                break;
            case 'up':
                tx = 0;
                ty = -distance;
                break;
            case 'right':
                tx = distance / 3;
                ty = CONFIG.TILE_SIZE/2;
                break;
            case 'left':
                tx = -distance*3
                ty = CONFIG.TILE_SIZE/2;
                break;
        }
        this.touch.setPosition(this.x + tx + CONFIG.TILE_SIZE/2, this.y + ty)
    }

    initAnimations() {
        // Idle
        this.anims.create({
            key: 'idle-right',
            frames: this.anims.generateFrameNumbers('player', {
                start: 24, end: 31 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        this.anims.create({
            key: 'idle-up',
            frames: this.anims.generateFrameNumbers('player', {
                start: 8, end: 15 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers('player', {
                start: 16, end: 23 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        
        this.anims.create({
            key: 'idle-down',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0, end: 7 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        // Walk
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', {
                start: 28, end: 33 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', {
                start: 34, end: 39 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player', {
                start: 40, end: 45 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', {
                start: 46, end: 51 }),
                frameRate: this.frameRate,
                repeat: -1
        })

        this.anims.create({
            key: 'cortar',
            frames: this.anims.generateFrameNumbers('player', {
                start: 130, end: 137 }),
                frameRate: 10,
                repeat: -1
        })

    }
}

