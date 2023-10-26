import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import WebSocketComponent from './WebSocketComponent';
import useWebSocket from "react-use-websocket";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game'; // Ich nehme an, dass Sie hier einen kleinen Fehler gemacht haben und "Game" wirklich die "About"-Seite ist.
import {WebSocketContext} from "./webSocketContext";

const socketURL = "ws://localhost:3001";

export default function App() {
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const numberOfFactories = 9;
  const [squares, setSquare] = useState(Array(100).fill(null));
  const [playerBords, setPlayerBord] = useState(Array(numberOfPlayers).fill(null));
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
  ,[webSocket.lastJsonMessage]);



  return (
    <Router>
      <div>
        {/* Navigation */}
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
          </Routes>
        </WebSocketContext.Provider>
      </div>
    </Router>
  );
}
