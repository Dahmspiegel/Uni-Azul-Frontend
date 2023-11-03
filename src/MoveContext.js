import { createContext, useContext } from "react";

const MoveContext = createContext(null);

const getMove = () => useContext(MoveContext);

export {
    MoveContext,
    getMove
}