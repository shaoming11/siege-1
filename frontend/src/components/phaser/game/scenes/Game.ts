import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera !: Phaser.Cameras.Scene2D.Camera;
    background !: Phaser.GameObjects.Image;
    balanceText !: Phaser.GameObjects.Text;
    betAmountText !: Phaser.GameObjects.Text;
    scoreText !: Phaser.GameObjects.Text;
    ballsText !: Phaser.GameObjects.Text;
    balance !: number;
    betAmount !: number;
    numberOfBalls !: number;
    bias !: number;
    ballsRemaining !: number;

    constructor() {
        super('Game');
        this.balance = 1000;
        this.betAmount = 10;
        this.numberOfBalls = 1;
        this.bias = 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        this.matter.world.setBounds(0,0, width, height);

        this.createUI();
        this.createPegs();
        this.createMultiplierZones();

        EventBus.emit('current-scene-ready', this);
    }

    createUI() {
        const { width } = this.cameras.main;

        // Balance display
        this.balanceText = this.add.text(20, 20, `Balance: $${this.balance}`, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#00ff00'
        });

        // Bet amount controls
        this.betAmountText = this.add.text(20, 60, `Bet Amount: $${this.betAmount}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        });

        // Bet amount buttons
        const decreaseBet = this.add.rectangle(260, 70, 40, 30, 0xff0000)
            .setInteractive({ useHandCursor: true });
        this.add.text(260, 70, '-', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

        const increaseBet = this.add.rectangle(310, 70, 40, 30, 0x00ff00)
            .setInteractive({ useHandCursor: true });
        this.add.text(310, 70, '+', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

        // Number of balls controls
        this.ballsText = this.add.text(20, 100, `Balls: ${this.numberOfBalls}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        });

        const decreaseBalls = this.add.rectangle(140, 110, 40, 30, 0xff0000)
            .setInteractive({ useHandCursor: true });
        this.add.text(140, 110, '-', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

        const increaseBalls = this.add.rectangle(190, 110, 40, 30, 0x00ff00)
            .setInteractive({ useHandCursor: true });
        this.add.text(190, 110, '+', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

        // Drop balls button
        const dropButton = this.add.rectangle(width / 2, 150, 200, 50, 0x3498db)
            .setInteractive({ useHandCursor: true });
        this.add.text(width / 2, 150, 'DROP BALLS', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Button interactions
        decreaseBet.on('pointerdown', () => {
            if (this.betAmount > 1) {
                this.betAmount--;
                this.updateUI();
            }
        });

        increaseBet.on('pointerdown', () => {
            if (this.betAmount < 100) {
                this.betAmount++;
                this.updateUI();
            }
        });

        decreaseBalls.on('pointerdown', () => {
            if (this.numberOfBalls > 1) {
                this.numberOfBalls--;
                this.updateUI();
            }
        });

        increaseBalls.on('pointerdown', () => {
            if (this.numberOfBalls < 20) {
                this.numberOfBalls++;
                this.updateUI();
            }
        });

        dropButton.on('pointerdown', () => {
            this.dropAllBalls();
        });
    }

    updateUI() {
        this.balanceText.setText(`Balance: $${this.balance}`);
        this.betAmountText.setText(`Bet Amount: $${this.betAmount}`);
        this.ballsText.setText(`Balls: ${this.numberOfBalls}`);
    }

    dropAllBalls() {
        const totalCost = this.betAmount * this.numberOfBalls;
        if (this.balance < totalCost) {
            console.log('Insufficient balance!');
            return;
        }

        // Drop balls with delay
        for (let i = 0; i < this.numberOfBalls; i++) {
            this.time.delayedCall(i * 300, () => {
                const randomX = Phaser.Math.Between(100, this.cameras.main.width - 100);
                this.dropBall(randomX);
            });
        }
    }

    dropBalls(betAmount: number, bias: number, balls: number) {
        console.log('Dropping balls:', { betAmount, bias, balls });
        this.betAmount = betAmount;
        this.bias = bias;
        
        // Drop balls automatically with slight delay between each
        for (let i = 0; i < balls; i++) {
            this.time.delayedCall(i * 500, () => {
                const randomX = Phaser.Math.Between(100, this.cameras.main.width - 100);
                this.dropBall(randomX);
            });
        }
    }

    setGameParams(betAmount: number, bias: number, balls: number) {
        console.log('Setting game params:', { betAmount, bias, balls });
        this.betAmount = betAmount;
        this.bias = bias;
        this.ballsRemaining = balls;
        this.updateScoreText();
    }

    updateScoreText() {
        this.scoreText.setText(`Balls Remaining: ${this.ballsRemaining}`);
    }

    private createPegs(): void {
        const { width } = this.cameras.main;
        const rows = 10;
        const startY = 250;
        const rowSpacing = 30;
        const pegRadius = 5;

        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3; // 3, 4, 5, ... 12 pegs
            const spacing = width / (pegsInRow + 1);
            const y = startY + row * rowSpacing;

            for (let i = 0; i < pegsInRow; i++) {
                const x = spacing * (i + 1);
                
                // Visual peg
                this.add.circle(x, y, pegRadius, 0xecf0f1);
                
                // Physics peg (static)
                this.matter.add.circle(x, y, pegRadius, {
                    isStatic: true,
                    restitution: 0.8,
                    friction: 0.1
                });
            }
        }
    }

    private createMultiplierZones(): void {
        const { width, height } = this.cameras.main;
        const multipliers = [2, 1, 0.5, 0.2, 0.1, 0.2, 0.5, 1, 2];
        const zoneWidth = width / multipliers.length;
        const zoneHeight = 80;
        const zoneY = height - zoneHeight;

        const colors: { [key: number]: number } = {
            2: 0xf39c12,    // Orange
            1: 0x3498db,    // Blue
            0.5: 0x9b59b6,  // Purple
            0.2: 0xe74c3c,  // Red
            0.1: 0x2c3e50   // Dark Gray
        };

        multipliers.forEach((multiplier, index) => {
            const x = index * zoneWidth;
            const color = colors[multiplier] || 0x3498db;

            // Zone rectangle
            this.add.rectangle(
                x + zoneWidth / 2,
                zoneY + zoneHeight / 2,
                zoneWidth - 2,
                zoneHeight,
                color,
                0.7
            );

            // Multiplier text
            this.add.text(
                x + zoneWidth / 2,
                zoneY + zoneHeight / 2,
                `${multiplier}x`,
                {
                    fontSize: '20px',
                    fontFamily: 'Arial Black',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            // Sensor to detect ball landing
            this.matter.add.rectangle(
                x + zoneWidth / 2,
                zoneY + zoneHeight / 2,
                zoneWidth - 2,
                zoneHeight,
                {
                    isStatic: true,
                    isSensor: true,
                    label: `multiplier_${multiplier}`
                }
            );
        });

        // Listen for collisions
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                
                // Check if ball hit a multiplier zone
                if (bodyA.label?.startsWith('multiplier_') && bodyB.label === 'ball') {
                    const multiplier = parseFloat(bodyA.label.split('_')[1]);
                    this.addScore(multiplier, bodyB.position.x, bodyB.position.y);
                    
                    // Destroy the ball after landing
                    this.time.delayedCall(500, () => {
                        this.matter.world.remove(bodyB);
                        (bodyB as MatterJS.BodyType & { gameObject?: Phaser.GameObjects.GameObject }).gameObject?.destroy();
                    });
                } else if (bodyB.label?.startsWith('multiplier_') && bodyA.label === 'ball') {
                    const multiplier = parseFloat(bodyB.label.split('_')[1]);
                    this.addScore(multiplier, bodyA.position.x, bodyA.position.y);
                    
                    this.time.delayedCall(500, () => {
                        this.matter.world.remove(bodyA);
                        (bodyA as MatterJS.BodyType & { gameObject?: Phaser.GameObjects.GameObject }).gameObject?.destroy();
                    });
                }
            });
        });
    }

    private dropBall(x: number): void {
        // Deduct bet amount from balance
        this.balance -= this.betAmount;
        this.updateUI();
        console.log('Deducting bet amount:', this.betAmount, 'New balance:', this.balance);

        const ballRadius = 8;
        const y = 200;

        // Visual ball
        const ballGraphic = this.add.circle(x, y, ballRadius, 0xf39c12);

        // Physics ball
        const ball = this.matter.add.circle(x, y, ballRadius, {
            restitution: 0.6,
            friction: 0.01,
            label: 'ball'
        }) as MatterJS.BodyType & { gameObject?: Phaser.GameObjects.GameObject };

        // Link graphic to physics body
        ball.gameObject = ballGraphic;

        // Update graphic position to match physics
        this.matter.world.on('afterupdate', () => {
            if (ball.gameObject) {
                ballGraphic.setPosition(ball.position.x, ball.position.y);
            }
        });
    }

    private addScore(multiplier: number, x: number, y: number): void {
        // Calculate payout
        const payout = this.betAmount * multiplier;
        console.log('Ball hit multiplier:', multiplier, 'Payout:', payout);
        
        // Add payout to balance
        this.balance += payout;
        this.updateUI();
        
        // Animated payout popup
        const popup = this.add.text(x, y, `+$${payout.toFixed(2)}`, {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#f39c12',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: popup,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => popup.destroy()
        });
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}