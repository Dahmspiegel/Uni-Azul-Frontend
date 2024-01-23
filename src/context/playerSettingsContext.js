import React, { createContext, useContext, useEffect, useState } from 'react';

const PlayerSettingsContext = createContext();

export const usePlayerSettings = () => {
    const context = useContext(PlayerSettingsContext);
    if (!context) {
        throw new Error('usePlayerSettings must be used within a PlayerSettingsProvider');
    }
    return context;
};
export const PlayerSettingsProvider = ({ children }) => {
    const [playerSettings, setPlayerSettings] = useState(null);

    const updatePlayerSettings = (data) => {
        setPlayerSettings(data);
    };

    useEffect(() => {
        // Hier wird die Ausgabe in der Konsole jedes Mal ausgelöst, wenn sich playerSettings ändert
        console.log('Player Data Updated:', playerSettings);
        // if (playerSettings.players && playerSettings.players.length > 0) {
            // console.log('Player Data Updated:', playerSettings.players[0].name);
        // }
    }, [playerSettings]); // Abhängigkeit von playerSettings

    return (
        <PlayerSettingsContext.Provider value={{ playerSettings, updatePlayerSettings }}>
            {children}
        </PlayerSettingsContext.Provider>
    );
};
