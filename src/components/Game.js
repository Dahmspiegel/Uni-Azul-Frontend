import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWebSocket } from '../webSocketContext';

function Game() {

    const [gameStatus, setGameStatus] = useState('not_found');

    const { gameId } = useParams();

    useEffect(() => {
        if (gameId) {
            setGameStatus('created');
        }
    }
        , [gameId]);

    const numberOfPlayers = useState(0);
    const numberOfFactories = useState(5);
    const [board, setBoard] = useState();

    const webSocket = getWebSocket();

    useEffect(() => {
        if (webSocket.lastJsonMessage) {
            const message = webSocket.lastJsonMessage;

            if (message.event === 'start_game' && message.data.id === gameId) {
                setGameStatus('started');
            }

            if (message.event === 'game_state_update') {
                if (gameStatus !== 'running') setGameStatus('running');
                setBoard(message.data);
                console.log(message.data);
            }
        }
    }, [webSocket.lastJsonMessage]);

    const startGame = () => {
        const gameData = {
            event: "start_game",
            data: {
                id: gameId
            }
        };

        webSocket.sendJsonMessage(gameData);
    };

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

    function flattenTiles(tiles) {
        const result = [];
        tiles.forEach(tile => {
            for (let i = 0; i < tile.number_of_tiles; i++) {
                result.push(convertColor(tile.color));
            }
        });
        return result;
    }

    function convertColor(color) {
        switch (color) {
            case 'B': return 'blue';
            case 'Y': return 'yellow';
            case 'R': return 'red';
            case 'K': return 'black';
            default: return 'white';
        }
    }

    function Factory({ tiles }) { // Destructure factory from props
        const flatTiles = flattenTiles(tiles);

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px' }}>
                {flatTiles.map((color, index) => (
                    // <div key={index} style={{ width: '10px', height: '10px' }}>
                    //     {color}
                    // </div>
                    <PatternSquare key={index} border='1px solid black' backgroundColor={color} />
                ))}
            </div>
        );
    }
    // function Factory(tiles) {
    //     const flatTiles = flattenTiles(tiles);

    //     return (
    //         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
    //             {flatTiles.map((color, index) => (
    //                 <div key={index} style={{ width: '10px', height: '10px'}}>
    //                 {/* <div key={index} style={{ width: '50px', height: '50px', backgroundColor: color }}> */}
    //                     {color}
    //                 </div>
    //             ))}
    //         </div>
    //     );
    //     // return (
    //     //     <div>
    //     //         {Array.from({ length: 2 }).map((_, rowIndex) => (
    //     //             <div key={rowIndex} style={styles.row}>
    //     //                 {Array.from({ length: 2 }).map((_, colIndex) => (
    //     //                     <PatternSquare key={colIndex} border='1px solid black' backgroundColor={factory}/>
    //     //                     // <div key={colIndex} style={styles.wallSquare}></div>
    //     //                 ))}
    //     //             </div>
    //     //         ))}
    //     //     </div>
    //     // );
    // }

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


    function Factories({ factories }) {
        return (
            <div style={styles.factoryRow}>
                {factories.map((fac, index) => (
                    <div key={index}>
                        {fac.is_center ? <Center /> : <Factory tiles={factories[index].tiles} />}
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
        <>
            {(gameStatus === "not_found") && (
                <h1>Not found</h1>
            )}

            {(gameStatus === "created") && (
                <div>
                    <h1>Game created, waiting for player</h1>
                    <button onClick={startGame}>Start Game</button>
                </div>
            )}

            {(gameStatus === "running") && (
                <>
                    <h1>Game started</h1>
                    <div style={styles.board}>
                        <div className="board-row" style={styles.factoryRow}>
                            <Factories factories={board.factories} />
                        </div>
                        <div className="board-row" style={styles.boardRow}>
                            {Array.from({ length: numberOfPlayers }).map((_, index) => (
                                <PlayerBoard key={index} numberOfPlayers={numberOfPlayers} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default Game;