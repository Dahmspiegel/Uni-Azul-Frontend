import React, { useState, useEffect } from 'react';

function WebSocketComponent() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://IHR_WEBSOCKET_SERVER');

        ws.onopen = () => {
            console.log('Verbindung zum WebSocket-Server hergestellt');
        };

        ws.onmessage = (event) => {
            const receivedData = event.data;
            setData(receivedData);
        };

        ws.onclose = () => {
            console.log('Verbindung zum WebSocket-Server getrennt');
        };

        // Die Verbindung schließen, wenn die Komponente unmountet wird
        return () => {
            ws.close();
        };
    }, []);

    return <div>Empfangene Daten: {data}</div>;
}

export default WebSocketComponent;
