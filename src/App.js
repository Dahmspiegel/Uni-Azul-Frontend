import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import WebSocketComponent from './WebSocketComponent';
import useWebSocket from "react-use-websocket";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Game from './components/Game'; // Ich nehme an, dass Sie hier einen kleinen Fehler gemacht haben und "Game" wirklich die "About"-Seite ist.

const socketURL = "ws://localhost:3001";

export default function App() {
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const numberOfFactories = 9;
  const [squares, setSquare] = useState(Array(100).fill(null));
  const [playerBords, setPlayerBord] = useState(Array(numberOfPlayers).fill(null));
  const [messages, setMessages] = useState([]);
  const {
    sendJsonMessage,
    lastJsonMessage
  } = useWebSocket(socketURL, {
    onOpen: () => console.log("Connection established"),
    onMessage: (msg) => console.log(msg),
    shouldReconnect: (_) => true
  });


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

        {/* Routing */}
        <Routes>
          <Route path="/" exact Component={Home} />
          <Route path="/game" Component={Game} />
          {/* Hier können Sie weitere Routen hinzufügen, wenn Sie möchten. */}
        </Routes>

        {/* Hier können Sie den Rest Ihres App-Inhalts hinzufügen. */}
      </div>
    </Router>
  );
}
