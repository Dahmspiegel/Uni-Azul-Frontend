import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import WebSocketComponent from './WebSocketComponent';
import useWebSocket from "react-use-websocket";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game'; // Ich nehme an, dass Sie hier einen kleinen Fehler gemacht haben und "Game" wirklich die "About"-Seite ist.
import { WebSocketContext } from "./webSocketContext";
import backgroundImage from './images/Backround.png';

const socketURL = "ws://localhost:3001";
const appStyle = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  padding: '10px',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  width: '100%',
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const webSocket = useWebSocket(socketURL, {
    onOpen: () => console.log("Connection established"),
    shouldReconnect: (_) => true
  });

  useEffect(() => {
    if (webSocket.lastJsonMessage) {
      setMessages(prev => [...prev, webSocket.lastJsonMessage]);
      console.log(webSocket.lastJsonMessage);
    }
  }
    , [webSocket.lastJsonMessage]);



  return (
    <Router>
      <div style={appStyle}>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/game">Game</Link></li>
          </ul>
        </nav>
        <WebSocketContext.Provider value={webSocket}>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/game/:gameId" Component={Game} />
            {/* <Route path="/game" Component={Game} /> */}
          </Routes>
        </WebSocketContext.Provider>
      </div>
    </Router>
  );
}
