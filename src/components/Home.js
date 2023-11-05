import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {getWebSocket} from '../webSocketContext';

function Home() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [playerTypes, setPlayerTypes] = useState([]);
    const navigate = useNavigate();

    const webSocket = getWebSocket();

    const handleNewGameClick = () => {
        setShowDropdown(true);
    };

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setPlayerTypes(Array(number).fill('human'));
    };

    const handlePlayerTypeChange = (index, type) => {
        const newPlayerTypes = [...playerTypes];
        newPlayerTypes[index] = type;
        setPlayerTypes(newPlayerTypes);
    };

    const redirectToGame = () => {
        const playersData = playerTypes.map((type, index) => ({
            name: `Player ${index + 1}`,
            type: type
        }));

        const gameData = {
            event: "new_game",
            data: {
                players: playersData
            }
        };

        webSocket.sendJsonMessage(gameData);
        // const gameDataJSON = JSON.stringify(gameData);
        // console.log(gameDataJSON);

        // navigate('/game/');
        // console.log('Starte Spiel...');
    }

    useEffect(() => {
        if (webSocket.lastJsonMessage) {
            const message = webSocket.lastJsonMessage;
            if (message.event === 'new_game') {
                navigate('/game/' + message.data.id);
            }
        }
    }, [webSocket.lastJsonMessage]);


    return (
        <div>
            <h1>Home</h1>
            <button onClick={handleNewGameClick}>New Game</button>
            {showDropdown && (
            <>
                <div style={{display: 'flex', gap: "5px", alignItems:"center"}}> 
                    <p>Spieleranzahl: </p>
                    <button className='playerSelectBox' onClick={() => handleNumberClick(2)}>2</button>
                    <button className='playerSelectBox' onClick={() => handleNumberClick(3)}>3</button>
                    <button className='playerSelectBox' onClick={() => handleNumberClick(4)}>4</button>
                    </div>
                    <div>
                    {selectedNumber && (
                        <>
                            <div>
                                {playerTypes.map((type, index) => (
                                    <div key={index}>
                                        Spieler {index + 1}:
                                        <select value={type} onChange={e => handlePlayerTypeChange(index, e.target.value)}>
                                            <option value="human">Mensch</option>
                                            <option value="greedy">Computer-greedy</option>
                                            <option value="random">Computer-random</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div style={{display: 'flex', gap: "5px", alignItems:"center", marginTop: "10px"}}>
                                <button onClick={() => setShowDropdown(false)}>Abbrechen</button>
                                <button onClick={() => redirectToGame()}>Start</button>   
                            </div>
                        </>
                    )}
                </div>
            </>
            )}
        </div>
    );
}

export default Home;