import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getWebSocket } from '../webSocketContext';
import { usePlayerSettings } from '../context/playerSettingsContext';

function Home() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [playerTypes, setPlayerTypes] = useState([]);
    const navigate = useNavigate();
    const { updatePlayerSettings } = usePlayerSettings();
    const allColors = ['Blue', 'Green', 'Red', 'Purple', 'White'];
    const webSocket = getWebSocket();

    const handleNewGameClick = () => {
        setShowDropdown(true);
    };

const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setPlayerTypes(Array.from({ length: number }, (_, index) => ({
            type: 'random',
            name: `random`,
            color: allColors[index % allColors.length] // Verwenden des Modulo-Operators, um innerhalb der Farbliste zu bleiben
        })));
    };

    const handlePlayerTypeChange = (index, type) => {
        const newPlayerTypes = [...playerTypes];
        newPlayerTypes[index].type = type;
        newPlayerTypes[index].name = type;
        setPlayerTypes(newPlayerTypes);
    };

    const handlePlayerNameChange = (index, name) => {
        const newPlayerTypes = [...playerTypes];
        newPlayerTypes[index].name = name;
        setPlayerTypes(newPlayerTypes);
    };

    const handlePlayerColorChange = (index, color) => {
        const newPlayerTypes = [...playerTypes];
        newPlayerTypes[index].color = color;
        setPlayerTypes(newPlayerTypes);
    };

    const getAvailableColors = (currentIndex) => {
        const selectedColors = playerTypes.map(player => player.color);
        return allColors.filter(color =>
            !selectedColors.includes(color) || color === playerTypes[currentIndex].color
        );
    };

    const redirectToGame = () => {
        const gameData = {
            event: "new_game",
            data: {
                players: playerTypes
            }
        };

        updatePlayerSettings({players: playerTypes});

        webSocket.sendJsonMessage(gameData);
    };

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
                    <div style={{ display: 'flex', gap: "5px", alignItems: "center" }}>
                        <p>Spieleranzahl: </p>
                        <button className='playerSelectBox' onClick={() => handleNumberClick(2)}>2</button>
                        <button className='playerSelectBox' onClick={() => handleNumberClick(3)}>3</button>
                        <button className='playerSelectBox' onClick={() => handleNumberClick(4)}>4</button>
                    </div>
                    <div>
                        {selectedNumber && (
                            <>
                                <div>
                                    {playerTypes.map((player, index) => (
                                        <div key={index}>
                                            Spieler {index + 1}:
                                            <input
                                                type="text"
                                                placeholder="Name eingeben"
                                                value={player.name}
                                                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                            />
                                            <select
                                                value={player.type}
                                                onChange={(e) => handlePlayerTypeChange(index, e.target.value)}>
                                                <option value="human">Mensch</option>
                                                <option value="greedy">Computer-greedy</option>
                                                <option value="random">Computer-random</option>
                                                <option value="mcts">Computer-Baum</option>
                                            </select>
                                            <select
                                                value={player.color}
                                                onChange={(e) => handlePlayerColorChange(index, e.target.value)}>
                                                {getAvailableColors(index).map(color => (
                                                    <option key={color} value={color}>{color}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: "5px", alignItems: "center", marginTop: "10px" }}>
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