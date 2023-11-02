import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWebSocket } from '../webSocketContext';
import { gameData } from './GameData';

function Game() {

    const [gameStatus, setGameStatus] = useState('not_found');
    // const [gameStatus, setGameStatus] = useState('running');
    const collorPalett = ['blue', 'yellow', 'red', 'black', 'lightgrey']

    const { gameId } = useParams();

    useEffect(() => {
        if (gameId) {
            setGameStatus('created');
        }
    }, [gameId]);

    const numberOfPlayers = useState(0);
    const numberOfFactories = useState(5);
    const [board, setBoard] = useState();
    // const [board, setBoard] = useState(gameData.data);

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
            border: '0.1vw solid black',
            margin: '0',
            alignItems: 'center',
            justifyContent: 'center',
        },
        whiteSquare: {
            width: '3vw',
            height: '3vw',
            display: 'inline-block',
            margin: '0.2vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'grey',
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
            minWidth: '100px'
        },
        playerBoardWrapper: {
            padding: '10px',
            marginBottom: '10px',
            display: 'inline-block'
        },
        playerBoard: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1px',
        },
        floorLine: {
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            marginTop: '5px'
        },
    };

    function flattenTiles(tiles) {
        const result = [];
        tiles.forEach(tile => {
            for (let i = 0; i < tile.number_of_tiles; i++) {
                result.push(convertColor(tile.color));
            }
        });

        if (result.length === 0) {
            for (let i = 0; i < 4; i++) {
                result.push("white");
            }
        }
        return result;
    }

    function convertColor(color) {
        switch (color) {
            case 'B': return 'blue';
            case 'Y': return 'yellow';
            case 'R': return 'red';
            case 'K': return 'black';
            default: return 'lightgrey';
        }
    }

    function Factory({ tiles }) {
        const flatTiles = flattenTiles(tiles);

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px' }}>
                {flatTiles.map((color, index) => (
                    <PatternSquare key={index} border='1px solid black' backgroundColor={color} />
                ))}
            </div>
        );
    }

    function Center({ tiles }) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px' }}>
                {tiles.map((tile, index) => (
                    <PatternSquare key={index} border='1px solid black' backgroundColor={convertColor(tile.color)} text={tile.number_of_tiles} />
                ))}
            </div>
        );
    }


    function Factories({ factories }) {
        return (
            <div style={styles.factoryRow}>
                {factories.map((fac, index) => (
                    <div key={index}>
                        {fac.is_center ? <Center tiles={factories[index].tiles} /> : <Factory tiles={factories[index].tiles} />}
                    </div>
                ))}
            </div>
        );
    }



    function PatternSquare({ border, backgroundColor, text, opacity }) {
        return <div style={{ ...styles.whiteSquare, border, backgroundColor, opacity }}>{text}</div>;
    }




    function getPatternLineData({ index, patternData }) {
        const lineData = patternData.find(data => data.patern_line_index === index);
        if (lineData) {
            return {
                color: convertColor(lineData.color),
                tiles: lineData.number_of_tiles
            };
        }
        return null;
    }

    function Pattern({ playerNumber, patternData }) {
        return (
            <div className="grid">
                {Array.from({ length: 25 }).map((_, index) => {
                    const rowIndex = Math.floor(index / 5);
                    const colIndex = index % 5;
                    const currentPatternLine = getPatternLineData({ index: rowIndex, patternData: patternData });

                    if (colIndex < 4 - rowIndex) {
                        return <PatternSquare key={index} border='1px solid white' />;
                    } else {
                        if (currentPatternLine && 4-colIndex < currentPatternLine.tiles) {
                            return <PatternSquare key={index} border='1px solid black' backgroundColor={currentPatternLine.color} />;
                        }
                        return <PatternSquare key={index} border='1px solid black' backgroundColor='white' />;
                    }
                })}
            </div>
        );
    }

    function isWallFieldPresent(row, col, wall) {
        return wall.some(field => field.row === row && field.col === col);
    }


    function Wall({ playerNumber, wallData }) {
        return (
            <div className="grid">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {Array.from({ length: 5 }).map((_, colIndex) => {
                            const colorIndex = (rowIndex + 5 - colIndex) % 5;
                            const opacityValue = isWallFieldPresent(rowIndex, colIndex, wallData) ? 1 : 0.25;
                            return (
                                <PatternSquare
                                    key={rowIndex * 5 + colIndex}
                                    border='1px solid black'
                                    backgroundColor={collorPalett[colorIndex]}
                                    opacity={opacityValue}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        );
    }




    function FloorLine({ floorLineProgress }) {
        return (
            <div style={{ ...styles.floorLine }}>
                {Array.from({ length: 7 }).map((_, colIndex) => (
                    <PatternSquare key={colIndex} border='1px solid black' backgroundColor={colIndex < floorLineProgress ? 'grey' : 'white'} />
                ))}
            </div>
        );
    }

    function ScoreBoardSquare(props) {
        const { color, number } = props; // Destructuring the props to get color and number

        return (
            <div
                style={{
                    ...styles.scoreSquare,
                    fontSize: '12px',
                    backgroundColor: color,
                }}
            >
                {number}
            </div>
        );
    }

    function ScoreBoard({ score }) {
        let scoreColor = "grey";
        if (score === undefined) score = 0;
        else if (score < 0) {
            score = 100 + score;
            scoreColor = "red";
        }
        else if (score > 100) {
            score = score % 100;
            scoreColor = "lightgreen";
        }
        const scoreRows = [];
        let currentNumber = 0;

        scoreRows.push(
            <div className="board-row" key={0}>
                <ScoreBoardSquare
                    key={currentNumber}
                    number={currentNumber}
                    color={currentNumber === score ? scoreColor : "white"}
                />
            </div>
        );

        for (let i = 1; i <= 100; i += 20) {
            scoreRows.push(
                <div className="board-row" key={i}>
                    {Array.from({ length: 20 }).map((_, j) => {
                        currentNumber = j + i;
                        return (
                            <ScoreBoardSquare
                                key={currentNumber}
                                number={currentNumber}
                                color={currentNumber === score ? scoreColor : "white"}
                            />
                        );
                    })}
                </div>
            );
        }

        return scoreRows;
    }



    function PlayerBoard({ playerData, playerNumber, currentPlayer }) {
        return (
            <div style={{
                ...styles.playerBoardWrapper,
                border: playerNumber === currentPlayer ? '2px solid red' : '2px solid black'
            }}>
                <ScoreBoard score={playerData.score} />
                <div style={styles.gameComponents}>
                    <Pattern playerNumber={playerNumber} patternData={playerData.pattern} />
                    <div style={{ width: '5vw' }}></div>
                    <Wall playerNumber={playerNumber} wallData={playerData.wall} />
                </div>
                <FloorLine floorLineProgress={playerData.floor_line_progress} />
            </div>
        );
    }

    // console.log(board);
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
                            {Array.from({ length: board.players.length }).map((_, index) => (
                                <PlayerBoard key={index} playerData={board.players[index]} playerNumber={index} currentPlayer={board.current_player} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default Game;