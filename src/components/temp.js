import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWebSocket } from '../webSocketContext';
import { MoveContext, getMove } from '../MoveContext';
const images = require.context('../images/', false, /\.png$/);
import { gameData } from './GameData';
import { usePlayerSettings } from '../context/playerSettingsContext';


function Temp() {

    const collorPalett = ['Blau', 'Grün', 'Rot', 'Lila', 'Weiß']
    const [board, setBoard] = useState(gameData.data);
    const { playerSettings } = usePlayerSettings();

    function Scoreboard() {
        console.log('playerSettings: ', playerSettings);
        const fields = Array.from({ length: 101 }, () => []);

        console.log(board);
        for (let i = 0; i < board.players.length; i++) {
            console.log('fiels: ', fields)
            const player = board.players[i];
            if (player.score >= 0 && player.score <= 100) {
                const imagePath = `./Azul_Kachel_${playerSettings.players[i].color}.png`;
                fields[player.score].push({
                    image: images(imagePath),
                });
            }
        }

        const firstRow = [fields[0]];
        const otherRows = [];
        for (let i = 1; i < fields.length; i += 20) {
            otherRows.push(fields.slice(i, i + 20));
        }

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {firstRow.map((field, index) => (
                        <ScoreField key={index} field={field} />
                    ))}
                </div>
                {otherRows.map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex', flexDirection: 'row' }}>
                        {row.map((field, fieldIndex) => (
                            <ScoreField key={fieldIndex} field={field} />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    function ScoreField({ field }) {
        const style = {
            width: '4vw',
            height: '4vw',
            border: '1px solid black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backgroundImage: `url(${images('./Azul_Kachel_Num.png')})`,
            backgroundSize: 'cover'
        };

        const getImageStyle = (index) => {
            if (field.length == 1) {
                return {
                    width: `${100 / 1.5}%`,
                    height: `${100 / 1.5}%`,
                    position: 'absolute',
                };
            } else if (field.length == 2) {
                return {
                    width: `${100 / field.length}%`,
                    height: `${100 / field.length}%`,
                    position: 'absolute',
                    left: `${(100 / field.length) * index}%`
                };
            } else {
                const positions = [
                    { left: '0%', top: '0%' },
                    { left: '50%', top: '0%' },
                    { left: '0%', top: '50%' },
                    { left: '50%', top: '50%' }
                ];
                const position = positions[index % 4];
                return {
                    width: '50%',
                    height: '50%',
                    position: 'absolute',
                    left: position.left,
                    top: position.top
                };
            }
        };

        return (
            <div style={style}>
                {field.map((player, idx) => (
                    <img
                        key={idx}
                        src={player.image}
                        alt={player.name}
                        style={getImageStyle(idx)}
                    />
                ))}
            </div>
        );
    }



    return (
        <>
            <Scoreboard />
            {/* <ScoreBoard score={playerSettings.score} /> */}
        </>
    );
}

export default Temp;