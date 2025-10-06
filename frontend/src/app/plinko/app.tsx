'use client'

import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from '@/components/PhaserGame';
import { MainMenu } from '@/components/phaser/game/scenes/MainMenu';
import { Game } from '@/components/phaser/game/scenes/Game';

export default function Plinko() 
{

    const buttonStyling = 'border-black border-5 p-5';

    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const [balance, setBalance] = useState<number>(1000);

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Listen for balance updates from the game
        const handleBalanceUpdate = (newBalance: number) => {
            console.log('Balance update received:', newBalance);
            setBalance(newBalance);
        };

        const handleBetDeduction = (betAmount: number) => {
            setBalance(prev => {
                const newBalance = prev - betAmount;
                console.log('Deducting bet:', betAmount, 'New balance:', newBalance);
                return Math.max(0, newBalance); // Don't go below 0
            });
        };

        const handlePayout = (payout: number) => {
            setBalance(prev => {
                const newBalance = prev + payout;
                console.log('Adding payout:', payout, 'New balance:', newBalance);
                return newBalance;
            });
        };

        // Import EventBus dynamically to avoid SSR issues
        import('@/components/phaser/game/EventBus').then(({ EventBus }) => {
            console.log('EventBus loaded, setting up listeners');
            EventBus.on('balance-updated', handleBalanceUpdate);
            EventBus.on('bet-deducted', handleBetDeduction);
            EventBus.on('payout-added', handlePayout);
        });

        return () => {
            import('@/components/phaser/game/EventBus').then(({ EventBus }) => {
                EventBus.off('balance-updated', handleBalanceUpdate);
                EventBus.off('bet-deducted', handleBetDeduction);
                EventBus.off('payout-added', handlePayout);
            });
        };
    }, []);


    const changeScene = () => 
    {
        if(phaserRef.current)
        {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene)
            {
                scene.changeScene();
            }
        }
    }


    const moveSprite = () => {
        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {
                scene.moveLogo(({x, y}) => {
                    setSpritePosition({x, y});
                })
            }
        }
    }

    const addSprite = () => {
        if (phaserRef.current) 
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                const star = scene.add.sprite(x, y, 'star');

                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }

    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== 'MainMenu');
    }

    return (
        <div id='plinko' className='flex items-center justify-center flex-col'>
            <div><h1 className='text-5xl align-middle w-full p-10'>plinko balls!</h1></div>
            <div className='bg-amber-200 w-2xl p-7 mb-4 text-xl justify-start hidden'>
                <p>Your Balance: ${balance.toFixed(2)}</p>
            </div>
            <div className='flex'>
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/>
                <div className='flex flex-col gap-4 ml-4 hidden'>
                    <div className='hidden'>
                        <div>
                            <button className={buttonStyling} onClick={changeScene}>Change Scene</button>
                        </div>
                        <div>
                            <button disabled={canMoveSprite} className={buttonStyling} onClick={moveSprite}>Toggle Movement</button>
                        </div>
                        <div className='spritePosition'>
                            Sprite Position: 
                            <pre>{`{\n x: ${spritePosition.x}\n y: ${spritePosition.y}\n}`}</pre>
                        </div>
                        <div>
                            <button className={buttonStyling} onClick={addSprite}>Add New Sprite</button>
                        </div>
                    </div>
                    <div>
                        <button className={buttonStyling}>drop ball</button>
                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        
                        const balls = parseInt(formData.get('balls') as string) || 1;
                        const bias = parseFloat(formData.get('bias') as string) || 0;
                        const betAmount = parseFloat(formData.get('betAmount') as string) || 1;
                        
                        console.log('Dropping balls:', { balls, bias, betAmount });
                        
                        // Drop balls automatically
                        if (phaserRef.current) {
                            const scene = phaserRef.current.scene;
                            console.log('Current scene:', scene?.scene.key);
                            
                            // Always switch to Game scene first
                            scene?.scene.start('Game');
                            
                            // Wait for scene to load then drop balls
                            setTimeout(() => {
                                const gameScene = phaserRef.current?.scene;
                                console.log('Game scene after timeout:', gameScene?.scene.key);
                                if (gameScene && gameScene.scene.key === 'Game') {
                                    console.log('Calling dropBalls method');
                                    (gameScene as Game).dropBalls(betAmount, bias, balls);
                                } else {
                                    console.log('Game scene not ready');
                                }
                            }, 200);
                        } else {
                            console.log('No phaserRef.current');
                        }
                    }}>
                        <label htmlFor="balls">Number of Balls: </label>
                        <input type='range' id='balls' name='balls' min={1} max={20} defaultValue={1}/>

                        <br></br>
                        <label htmlFor="bias">Center Bias: </label>
                        <input type='range' id='bias' name='bias'/>

                        <br></br>
                        <label htmlFor="betAmount">Bet Amount: </label>
                        <input type='number' id='betAmount' name='betAmount' className='border-1' min={0.01} step={0.01} max={balance}/>

                        <br></br>
                        <input type="submit" value="Submit" className='border-1 hover:cursor-pointer'/>
                    </form>
                </div>
            </div>
        </div>
    )
}