import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from '../../src/components/phaser/PhaserGame';

function App()
{
    const balance = 100;

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                // Add a new sprite to the current scene at a random position
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                scene.add.sprite(x, y, 'star');
    
            }
        }
    }

    return (
        <div id="app">
            <div>
      <p>
        table of contents
      </p>
      <h1 className="text-9xl">gambling</h1>
      <p className="text-5xl py-5">
        Your current balance: {balance}
      </p>
      <h2>how does this game work?</h2>
      <p>
        basically every hour or 10 minutes u get 100 coins to gamble and u can decide whether or not u wanna gamble and theres a leaderboard somewhere
      </p>
      <p>
        mvp will be just flip a coin
        then make it so u can do higher risk lower probability
      </p>
    </div>
            <PhaserGame ref={phaserRef} />
            <div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div>
        </div>
    )
}

export default App
