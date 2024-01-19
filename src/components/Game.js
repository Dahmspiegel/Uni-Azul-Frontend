import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWebSocket } from '../webSocketContext';
import { MoveContext, getMove } from '../MoveContext';
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

    // const [board, setBoard] = useState(gameData.data);
    const [board, setBoard] = useState();
    const [boardQueue, setBoardQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [posMoves, setPosMoves] = useState([]);
    const [requestID, setReqestId] = useState([]);
    const [showMoves, setShowMoves] = useState([]);
    const [movePlayerNumber, setMovePlayerNumber] = useState(0);
    const [myPattern, setMyPattern] = useState();

    const webSocket = getWebSocket();

    useEffect(() => {
        let timerId;
        if (isTimerActive) {
            timerId = setInterval(() => {
                if (currentIndex < boardQueue.length) {
                    // setBoard(boardQueue[currentIndex]);
                    setCurrentIndex(prevIndex => Math.min(boardQueue.length - 1, prevIndex + 1));
                }
            }, 500);
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [boardQueue.length, isTimerActive]);

    useEffect(() => {
        setBoard(boardQueue[currentIndex]);
    }, [currentIndex]);

    const undoMove = () => {
        setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
    };

    const redoMove = () => {
        setCurrentIndex(prevIndex => Math.min(boardQueue.length - 1, prevIndex + 1));
    };

    const toggleTimer = () => {
        setIsTimerActive(!isTimerActive);
    };

    useEffect(() => {
        if (webSocket.lastJsonMessage) {
            const message = webSocket.lastJsonMessage;

            if (message.event === 'start_game' && message.data.id === gameId) {
                setGameStatus('started');
            }

            if (message.event === 'game_state_update') {
                if (gameStatus !== 'running') setGameStatus('running');

                if (boardQueue.length === 0) {
                    setBoard(message.data);
                }
                setBoardQueue(boardQueue => [...boardQueue, message.data]);


                // setBoard(message.data);
            }
            else if (message.event === 'move_request') {
                // console.log(message.data);
                setPosMoves(message.data.move_list);
                setShowMoves(message.data.move_list);
                setReqestId(message.data.request_id);
                setMovePlayerNumber(message.data.game_state.current_player);
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
        selectRow: (rowIndex, playerNumber) => {
            const newPlayerNumber = playerNumber
            if (showMoves.length === 0) return;
            if (newPlayerNumber !== movePlayerNumber) return;
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
            color: 'red',
        },
        boardRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1.5vw',
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
        missingTile: {
            display: 'inline-block',
            boxShadow: 'inset 2px 2px 2px rgba(0, 0, 0, 0.3), inset -2px -2px 2px rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(80, 15, 15, 0.35)',
            borderRadius: '3px',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
        },
        darkBoardWraper: {
            padding: '10px',
            marginBottom: '10px',
            display: 'inline-block',
            boxShadow: 'inset 10px 10px 10px rgba(0, 0, 0, 0.3), inset -10px -10px 15px rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(80, 15, 15, 0.2)',
            borderRadius: '20px',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
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

    function flattenTiles({tiles, isCenter}) {
        const result = [];
        tiles.forEach(tile => {
            for (let i = 0; i < tile.number_of_tiles; i++) {
                result.push(tile.color);
            }
        });

        if (result.length === 0 && !isCenter) {
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
            default: return 'Empty';
        }
    }

    function Factory({ tiles, factoryIndex, isCenter }) {
        const flatTiles = flattenTiles({tiles, isCenter});
        const moveContext = getMove();

        return (
            <div style={{ ...styles.gridCenterStyle }}>
                {flatTiles.map((color, index) => (
                    <PatternSquare
                        key={index}
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
                    <div style={{
                        ...styles.darkBoardWraper, padding: '6px', borderRadius: '0.8vw'
                    }} key={index}>
                        <Factory tiles={factory.tiles} factoryIndex={index} isCenter={factory.is_center} />
                    </div>
                ))}
            </div>
        );
    }


    function PatternSquare({ border, backgroundColor, text, opacity, onClick }) {
        if (!backgroundColor) {
            return <div style={{ ...styles.tileSquare, border }} onClick={onClick}>{text}</div>;
        }
        
        if (backgroundColor === 'Empty') {
            return <div style={{ ...styles.tileSquare, border, ...styles.missingTile }} onClick={onClick}>{text}</div>;
        }

        const imageSrc = images(`./Azul_Kachel_${backgroundColor}.png`);

        if (backgroundColor === 'Num') {
            return (
                <div style={{ ...styles.tileSquare, border, opacity, position: 'relative' }} onClick={onClick}>
                    <img src={imageSrc} style={{ width: '100%', height: '100%' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {("-" + text)}
                    </div>
                </div>
            )
        }

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
                        return <PatternSquare key={index} />;
                    } else {
                        if (currentPatternLine && 4 - colIndex < currentPatternLine.tiles) {
                            return <PatternSquare key={index} border='1px solid black' backgroundColor={currentPatternLine.color} onClick={() => moveContext.selectRow(rowIndex, playerNumber)} />;
                        }
                        return <PatternSquare key={index} backgroundColor='Empty' onClick={() => moveContext.selectRow(rowIndex, playerNumber)} />;
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


    function FloorLine({ floorLineProgress, playerNumber, floorLinePenalty }) {
        return (
            <div style={{ ...styles.floorLine }}>
                {Array.from({ length: 7 }).map((_, colIndex) => (
                    <PatternSquare key={colIndex} backgroundColor='Black' opacity={colIndex < floorLineProgress ? 1 : 0.2} onClick={() => moveContext.selectRow(5, playerNumber)} />
                ))}
                <PatternSquare key={7} backgroundColor={'Num'} text={floorLinePenalty} />
            </div>
        );
    }

    function ScoreBoardSquare(props) {
        const { color, number, filter} = props;

        let backgroundImage = images(`./Azul_Kachel_Num.png`);

        return (
            <div style={{ ...styles.scoreSquare, fontSize: '12px', position: 'relative', color: color, border: `1px solid ${color}` }}>
                <img src={backgroundImage} style={{ width: '100%', height: '100%', filter: filter }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {number}
                </div>
            </div>
        );
    }


    function ScoreBoard({ score }) {
        let scoreColor = "blue";
        let outline = "1px solid blue";
        if (score === undefined) score = 0;
        else if (score < 0) {
            score = 100 + score;
            scoreColor = "red";
        }
        else if (score > 100) {
            score = score % 100;
            scoreColor = "green";
        }
        const scoreRows = [];
        let currentNumber = 0;

        scoreRows.push(
            <div className="board-row" key={0}>
                <ScoreBoardSquare
                    key={currentNumber}
                    number={currentNumber}
                    color={currentNumber === score ? scoreColor : "black"}
                    filter={currentNumber === score ? "none" : 'grayscale(80%)'}
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
                                color={currentNumber === score ? scoreColor : "black"}
                                filter={currentNumber === score ? "none" : 'grayscale(80%)'}
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
                ...styles.darkBoardWraper,
                border: playerNumber === currentPlayer ? '2px light red' : '2px light black',
            }}>
                <div>
                    <h2 style={{ color: playerNumber === currentPlayer ? 'white' : 'black' }}>
                        {'Spieler ' + (playerNumber + 1)}
                    </h2>
                    <ScoreBoard score={playerData.score} />
                    <div style={styles.gameComponents}>
                        <Pattern playerNumber={playerNumber} patternData={playerData.pattern} />
                        <div style={{ width: '5vw' }}></div>
                        <Wall playerNumber={playerNumber} wallData={playerData.wall} />
                    </div>
                    <FloorLine floorLineProgress={playerData.floor_line_progress} playerNumber={playerNumber} floorLinePenalty={playerData.floor_line_penalty} />
                </div>
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

            {(gameStatus === "running") && board && (
                <MoveContext.Provider value={moveContext}>
                    <h1 style={{ color: 'white', ...styles.darkBoardWraper, padding: '10px', borderRadius: '5px', }}>
                        {"Spieler " + (board.current_player + 1) + " ist am Zug"}
                    </h1>
                    <div>
                        <button onClick={undoMove}>Undo</button>
                        <button onClick={redoMove}>Redo</button>
                        <button onClick={toggleTimer}>
                            {isTimerActive ? 'Pause Timer' : 'Start Timer'}
                        </button>
                    </div>
                    <div style={styles.board}>
                        <div className="board-row" style={styles.factoryRow}>
                            <Factories factories={board.factories} />
                        </div>
                        <div style={styles.boardRow}>
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