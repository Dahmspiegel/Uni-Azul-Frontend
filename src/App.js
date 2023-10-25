import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import WebSocketComponent from './WebSocketComponent';
import useWebSocket from "react-use-websocket";

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
    onOpen : () => console.log("Connection established"),
    onMessage : (msg) => console.log(msg),
    shouldReconnect : (_) => true
  });

  const newGame = () => {
    sendJsonMessage({
      "event": "new_game",
      "data": {
        "players": [
          { "name": "Player 1", "type": "human" },
          { "name": "Player 2", "type": "computer" }
        ]
      }
    });
  }

  const styles = {
    scoreSquare: {
      width: '2vw',
      height: '2vw',
      display: 'inline-block',
      margin: '0',
    },
    whiteSquare: {
      width: '3.2vw',
      height: '3.2vw',
      display: 'inline-block',
      margin: '0.2vw',
    },
    wallSquare: {
      width: '3.2vw',
      height: '3.2vw',
      display: 'inline-block',
      border: '0.1vw solid black',
      margin: '0.2vw',
    },
    row: {},
    board: {
      gap: '2vw',
    },
    boardRow: {
      marginBottom: '2vw',
    },
    factoryRow: {
      display: 'flex',
      gap: '1vw'
    },
    gameComponents: {
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'left',
      marginTop: '1vw',
      minWidth: '2000px'
    }
  };


  function Factory() {
    return (
      <div>
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {Array.from({ length: 2 }).map((_, colIndex) => (
              <div key={colIndex} style={styles.wallSquare}></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function Center() {
    return (
      <div>
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {Array.from({ length: 3 }).map((_, colIndex) =>
              (rowIndex === 1 && colIndex === 2) ?
                <div key={colIndex} style={styles.whiteSquare}></div> :
                <div key={colIndex} style={styles.wallSquare}></div>
            )}
          </div>
        ))}
      </div>
    );
  }


  function Factories() {
    return (
      <div style={styles.factoryRow}>
        {Array.from({ length: numberOfFactories + 1 }).map((_, index) => (
          <div key={index}>
            {index === numberOfFactories ? <Center /> : <Factory />}
          </div>
        ))}
      </div>
    );
  }



  function PatternSquare({ border, backgroundColor }) {
    return <div style={{ ...styles.whiteSquare, border, backgroundColor }}></div>;
  }

  function Pattern() {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {Array.from({ length: 4 - rowIndex }).map((_, colIndex) => (
              <PatternSquare key={colIndex} border='1px solid white' />
            ))}
            {Array.from({ length: 5 - (4 - rowIndex) }).map((_, colIndex) => (
              <PatternSquare key={colIndex} border='1px solid black' backgroundColor='white' />
            ))}
          </div>
        ))}
      </div>
    );
  }

  function Wall() {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div key={colIndex} style={styles.wallSquare}></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function FloorLine(props) {
    return (
      <div style={{ ...styles.row, ...props.style }}>
        {Array.from({ length: 7 }).map((_, colIndex) => (
          <PatternSquare key={colIndex} border='1px solid black' backgroundColor='white' />
        ))}
      </div>
    );
  }

  // Ändern Sie den Stil basierend auf dem `value`-Prop
  function Square(props) {
    return (
      <button
        onClick={props.onSquareClick}
        style={{
          ...styles.scoreSquare,
          fontSize: '14px',
          backgroundColor: props.value ? 'red' : 'white'  // Farbänderung basierend auf value (hier: wenn 'X' dann rot, sonst weiß)
        }}
      >
        {props.number}
      </button>
    );
  }

  function ScoreBoard() {
    const [scoreSquares, setScoreSquares] = useState(Array(100).fill(null));

    const handleClick = (index) => {
      const newSquares = [...scoreSquares];
      newSquares[index] = newSquares[index] ? null : 'X';  // Umschalten zwischen null und 'X'
      setScoreSquares(newSquares);
    };

    const scoreRows = [];
    scoreRows.push(
      <div className="board-row" key={0}>
        <Square key={0} number={0} value={scoreSquares[0]} onSquareClick={() => handleClick(0)} />
      </div>
    );

    for (let i = 1; i <= 100; i += 20) {
      scoreRows.push(
        <div className="board-row" key={i}>
          {Array.from({ length: 20 }).map((_, j) => (
            <Square key={j + i} number={j + i} value={scoreSquares[j + i]} onSquareClick={() => handleClick(j + i)} />
          ))}
        </div>
      );
    }

    return scoreRows;
  }



  function PlayerBoard() {
    return (
      <>
        <ScoreBoard />
        <div style={styles.gameComponents}>
          <Pattern />
          <div style={{ width: '60px' }}></div>
          <Wall />
        </div>
        <FloorLine style={{ marginTop: '5px' }} />
      </>
    )
  }

  return (
    <div style={styles.board}>
      <button onClick={newGame}>new Game</button>
      <div className="board-row" style={styles.factoryRow}>
        <Factories />
      </div>
      <div className="board-row" style={styles.boardRow}>
        {Array.from({ length: numberOfPlayers }).map((_, index) => (
          <PlayerBoard key={index} numberOfPlayers={numberOfPlayers} />
        ))}
      </div>
    </div>
  );
}

