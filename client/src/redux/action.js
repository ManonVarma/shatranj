import { 
    USERS, 
    PLAYER_COLOR, 
    CALL_ACCEPTED, 
    CALL_ENDED, 
    OPPONENT_CONNECTED, 
    GAME_OVER, 
    RESET_GAME 
} from "./action.type"

export const usersAction = (data) => {
    return {
        type: USERS,
        payload: data
    }
}

export const playerColorAction = (data) => {
    return {
        type: PLAYER_COLOR,
        payload: data
    }
}

export const callAcceptedAction = (data) => {
    return {
        type: CALL_ACCEPTED,
        payload: data
    }
}

export const callEndedAction = (data) => {
    return {
        type: CALL_ENDED,
        payload: data
    }
}

export const opponentConnectedAction = (data) => {
    return {
        type: OPPONENT_CONNECTED,
        payload: data
    }
}

export const gameOverAction = (data) => {
    return {
        type: GAME_OVER,
        payload: data
    }
}

export const resetGameAction = (data) => {
    return {
        type: RESET_GAME,
        payload: data
    }
}