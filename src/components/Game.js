import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWebSocket } from '../webSocketContext';
import { MoveContext, getMove } from '../MoveContext';
import imageSrc from '../images/Azul_Kachel_Blau.png';
const images = require.context('../images/', false, /\.png$/);
import { gameData } from './GameData';

function Game() {

    const [gameStatus, setGameStatus] = useState('not_found');
    // const [gameStatus, setGameStatus] = useState('running');
    const collorPalett = ['Blau', 'Grün', 'Rot', 'Lila', 'Weiß']

    const { gameId } = useParams();

    useEffect(() => {
        if (gameId) {
            setGameStatus('created');
        }
    }, [gameId]);

    const [board, setBoard] = useState();
    // const [board, setBoard] = useState(gameData.data);
    const [posMoves, setPosMoves] = useState([]);
    const [requestID, setReqestId] = useState([]);
    const [showMoves, setShowMoves] = useState([]);
    const [myPattern, setMyPattern] = useState();

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
            else if (message.event === 'move_request') {
                console.log(message.data);
                setPosMoves(message.data.move_list);
                setShowMoves(message.data.move_list);
                setReqestId(message.data.request_id);
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

    const moveContext = {
        selectTile: (factoryId, color) => {
            if (color === 'white') return;
            setShowMoves(posMoves.filter(move => move.take_from_factory_index === factoryId && move.color === color));
            setMyPattern([0, 0, 0, 0, 0, 0]);
        },
        selectRow: (rowIndex) => {
            if (showMoves.length === 0) return;
            const newPattern = [...myPattern];
            newPattern[rowIndex] = myPattern[rowIndex] + 1;

            let mySum = newPattern.reduce((acc, curr) => acc + curr, 0);
            const goalSum = showMoves[0].pattern.reduce((acc, curr) => acc + curr, 0);

            if (mySum === goalSum) {
                let newShowMoves = showMoves.filter(move => arraysAreEqual(move.pattern, newPattern));

                if (newShowMoves.length == 1) {
                    let moveData = {
                        event: "move_response",
                        data: {
                            request_id: requestID,
                            move_index: posMoves.indexOf(newShowMoves[0])
                        }
                    };
                    console.log('Valid move', moveData);
                    webSocket.sendJsonMessage(moveData);
                }
            }

            setMyPattern(newPattern);
        }

    };

    function arraysAreEqual(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
    }

    // useEffect(() => {
    //     console.log("showMoves:", showMoves);
    // }, [showMoves]);

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
        tileSquare: {
            width: '3vw',
            height: '3vw',
            display: 'inline-block',
            margin: '0.2vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'grey',
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
        gridCenterStyle: {
            display: 'grid',
            gap: '1px',
            gridAutoFlow: 'column',
            gridTemplateRows: 'repeat(2, 1fr)'
        }
    };

    function flattenTiles(tiles) {
        const result = [];
        tiles.forEach(tile => {
            for (let i = 0; i < tile.number_of_tiles; i++) {
                result.push(tile.color);
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
            case 'B': return 'Blau';
            case 'Y': return 'Grün';
            case 'R': return 'Rot';
            case 'K': return 'Lila';
            case 'W': return 'Weiß';
            default: return 'Null';
        }
    }

    function Factory({ tiles, factoryIndex}) {
        const flatTiles = flattenTiles(tiles);
        const moveContext = getMove();

        return (
            <div style={{...styles.gridCenterStyle}}>
                {flatTiles.map((color, index) => (
                    <PatternSquare
                        key={index}
                        border='1px solid black'
                        backgroundColor={convertColor(color)}
                        onClick={() => moveContext.selectTile(factoryIndex, color)}
                    />
                ))}
            </div>
        );
    }

    function Factories({ factories }) {
        return (
            <div style={styles.factoryRow}>
                {factories.map((factory, index) => (
                    <div key={index}>
                        <Factory tiles={factory.tiles} factoryIndex={index} />
                    </div>
                ))}
            </div>
        );
    }


    function PatternSquare({ border, backgroundColor, text, opacity, onClick}) {
        if (!backgroundColor) {
            return <div style={{ ...styles.tileSquare, border, opacity }} onClick={onClick}>{text}</div>;
        }
        const imageSrc = images(`./Azul_Kachel_${backgroundColor}.png`);

        return (
            <div style={{ ...styles.tileSquare, backgroundColor, opacity }} onClick={onClick}>
                <img src={imageSrc} style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }



    function getPatternLineFill({ index, patternData }) {
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
                    const currentPatternLine = getPatternLineFill({ index: rowIndex, patternData: patternData });

                    if (colIndex < 4 - rowIndex) {
                        return <PatternSquare key={index} border='1px solid white' onClick={() => moveContext.selectRow(rowIndex)} />;
                    } else {
                        if (currentPatternLine && 4 - colIndex < currentPatternLine.tiles) {
                            return <PatternSquare key={index} border='1px solid black' backgroundColor={currentPatternLine.color} onClick={() => moveContext.selectRow(rowIndex)} />;
                        }
                        return <PatternSquare key={index} border='1px solid black' backgroundColor='Null' onClick={() => moveContext.selectRow(rowIndex)} />;
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
                            const colorIndex = (colIndex + 5 - rowIndex) % 5;
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
                    <PatternSquare key={colIndex} border='1px solid black' backgroundColor={colIndex < floorLineProgress ? 'Grey' : 'Null'} onClick={() => moveContext.selectRow(5)} />
                ))}
            </div>
        );
    }

    function ScoreBoardSquare(props) {
        const { color, number } = props;

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
                <MoveContext.Provider value={moveContext}>
                    <h1>{"Spieler " + board.current_player + " ist am Zug"}</h1>
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
                </MoveContext.Provider>
            )}
        </>
    );
}

export default Game;