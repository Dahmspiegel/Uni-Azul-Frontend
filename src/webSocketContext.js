import { createContext, useContext } from "react";

const WebSocketContext = createContext(null);

const getWebSocket = () => useContext(WebSocketContext);

export {
    WebSocketContext,
    getWebSocket
}

