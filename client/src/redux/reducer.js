import { 
    USERS, 
    PLAYER_COLOR, 
    CALL_ACCEPTED, 
    CALL_ENDED, 
    OPPONENT_CONNECTED,
    GAME_OVER, 
    RESET_GAME 
} from "./action.type"

const initailState = {
    playerColor: null,
    users : null,
    callAccepted: false,
    callEnded: false,
    opponentConnected: false,
    gameOver: false,
    resetGame: false
}

export const rootReducer = (state=initailState,action) => {
    switch(action.type){
        case USERS:
            return{
                ...state,
                users: action.payload
            }

        case PLAYER_COLOR:
            return{
                ...state,
                playerColor: action.payload
            }    

        case CALL_ACCEPTED:
            return{
                ...state,
                callAccepted: action.payload
            }   
        
        case CALL_ENDED:
            return{
                ...state,
                callEnded: action.payload
            }

        case OPPONENT_CONNECTED: 
            return {
                ...state,
                opponentConnected: action.payload
            }

        case GAME_OVER:
            return {
                ...state,
                gameOver: action.payload
            }
        
        case RESET_GAME:
            return {
                ...state,
                resetGame: action.payload
            }

        default:
            return state;
    }
}

