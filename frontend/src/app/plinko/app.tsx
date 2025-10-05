'use client'

import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from '@/components/PhaserGame';
import { MainMenu } from '@/components/phaser/game/scenes/MainMenu';

export default function Plinko() 
{
    const url = 'localhost:8080'

    const buttonStyling = 'border-black border-5 p-5';

    const [canMoveSprite, setCanMoveSprite] = useState(true);

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

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

    const dropBall = () => {

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
            <div className='bg-amber-200 w-2xl p-7 mb-4 text-xl justify-start'>
                <p>Your Balance: ${100}</p>
            </div>
            <div className='flex'>
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene}/>
                <div className='flex flex-col gap-4 ml-4'>
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
                    <form action={`${url}/bet`} method='post'>
                        <label htmlFor="rows">Rows: </label>
                        <input type='range' id='rows'/>

                        <br></br>
                        <label htmlFor="balls">Number of Balls: </label>
                        <input type='range' id='balls' min={1} max={20} defaultValue={1}/>

                        <br></br>
                        <label htmlFor="bias">Center Bias: </label>
                        <input type='range' id='bias'/>

                        <br></br>
                        <label htmlFor="quantity">Bet Amount: </label>
                        <input type='number' id='quantity' className='border-1'/>

                        <br></br>
                        <input type="submit" value="Submit" className='border-1 hover:cursor-pointer'/>
                    </form>
                </div>
            </div>
        </div>
    )
}