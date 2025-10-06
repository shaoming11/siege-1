import { GameObjects, Scene } from 'phaser';


export class MainMenu extends Scene {
    background !: GameObjects.Image;
    logo !: GameObjects.Image;
    title !: GameObjects.Text;
    logoTween !: Phaser.Tweens.Tween | null;
    ball !: GameObjects.Arc;
    pins !: GameObjects.Arc;
    gravity !: number;
    dy !: number;

    constructor() {
        super('MainMenu');

        this.gravity = 0.1
        this.dy = 0
    }

    create() {
        const { width, height } = this.cameras.main

        this.background = this.add.image(512, 384, 'background');

        this.title = this.add.text(320, 460, 'PLINKO BALLS', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const playButton = this.add.rectangle(
            width/2,
            height/2 + 50,
            200,
            60,
            0x27ae60
        ).setInteractive({ useHandCursor: true });

        this.add.text(
            width / 2,
            height / 2 + 50,
            'PLAY',
            {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x2ecc71);
            this.tweens.add({
                targets: playButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x27ae60);
            this.tweens.add({
                targets: playButton,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            })
        })

        playButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        
        this.createFloatingBalls();
    }

    createFloatingBalls() {
        const { width, height } = this.cameras.main;
        const colors = [0xe74c3c, 0x3498db, 0xf39c12, 0x9b59b6, 0x1abc9c];

        for (let i = 0; i < 8; i++ ) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(height / 2 + 150, height - 50);
            const size = Phaser.Math.Between(15, 30);
            const color = Phaser.Utils.Array.GetRandom(colors);

            this.add.circle(x, y, size, color, 0.3);

            this.tweens.add({
                targets: this.ball,
                y: y - Phaser.Math.Between(10, 30),
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            })
        }
    }

    update() {

    }

    changeScene() {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo(reactCallback: ({ x,y }: {x: number, y: number}) => void) {
        if (this.logoTween) 
        {
            if(this.logoTween.isPlaying()) 
            {
                this.logoTween.pause();
            }
            else 
            {
                this.logoTween.play();
            }
        }

        else 
        {
            this.logoTween = this.tweens.add(
            {
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut'},
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback) 
                    {
                        reactCallback(
                        {
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        })
                    }
                }
            })
        }
    }
}