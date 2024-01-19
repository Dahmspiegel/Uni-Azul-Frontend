import React, { createContext, useContext, useEffect, useState } from 'react';

const PlayerDataContext = createContext();

export const usePlayerData = () => useContext(PlayerDataContext);

export const PlayerDataProvider = ({ children }) => {
    const [playerData, setPlayerData] = useState([]);

    const updatePlayerData = (data) => {
        setPlayerData(data);
    };

    useEffect(() => {
        // Hier wird die Ausgabe in der Konsole jedes Mal ausgelöst, wenn sich playerData ändert
        console.log('Player Data Updated:', playerData);
    }, [playerData]); // Abhängigkeit von playerData

    return (
        <PlayerDataContext.Provider value={{ playerData, updatePlayerData }}>
            {children}
        </PlayerDataContext.Provider>
    );
};
