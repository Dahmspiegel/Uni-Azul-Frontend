import { useState } from "react";


export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquare] = useState(Array(9).fill(null));

  function handleClick(square) {
    if (squares[square] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[square] = 'X';
    }
    else {
      nextSquares[square] = 'O';
    }
    setSquare(nextSquares);
    setXIsNext(!xIsNext);
  }

  function NextPlayer({squares}) {
    const potentialWinner = calculateWinner(squares);
    let text;
    if (potentialWinner) {
      text = 'Winner is: ' + potentialWinner;
    }
    else {
      text = 'Next Player: ' + (xIsNext? 'X' : 'O');
    }
    return(
        <div className="status">{text}</div>
    )
  }

  function Square({ value, onSquareClick }) {
    return (
      <button
        className="square"
        onClick={onSquareClick}
      >
        {value}
      </button>
    )
  }


  return (
    <>
      <NextPlayer squares={squares} />
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function calculateWinner(squares){
  const winninglines=[
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  for (let i = 0; i < winninglines.length; i++){
    const [a,b,c] = winninglines[i];
    if (squares[a] && squares[a] == squares[b] && squares[a] == squares[c]) {
      return squares[a];
    }
  }
  return null
}