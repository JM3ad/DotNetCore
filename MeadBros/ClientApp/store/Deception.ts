import { Action, Reducer, ActionCreator} from 'redux';
import { AppThunkAction } from '.';
import { connection } from '../configureStore';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.
export enum Direction {
    North = 1,
    East,
    South,
    West
}

export interface DeceptionState {
    gameHasStarted: boolean,
    game: DeceptionGameState,
    lobby: LobbyState
}

interface DeceptionGameState {
    isUndercover: boolean,
    voteResult: Direction[],
    ambushWasSuccess: boolean,
    roundsCompleted: number,
    hasVotedThisRound: boolean,
    hint: string,
    gameResult: boolean,
    gameOver: boolean
}

interface LobbyState {
    lobbyCode: string,
    hasJoinedLobby: boolean
}

const unloadedState: DeceptionState = {
    gameHasStarted: false,
    game: {
        isUndercover: false,
        voteResult: [],
        roundsCompleted: 0,
        ambushWasSuccess: false,
        hasVotedThisRound: false,
        hint: '',
        gameResult: false,
        gameOver: false
    },
    lobby: {
        lobbyCode: '',
        hasJoinedLobby: false
    }
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface InitialiseAction { type: 'INITIALISE', lobby: string };
interface VoteAction { type: 'VOTE' };
interface ReceiveVoteResults { type: 'RECEIVE_VOTE_RESULTS'; votes: Direction[] };
interface ReceiveAmbushResults { type: 'RECEIVE_AMBUSH_RESULTS'; ambushSucceeded: boolean };
interface ReceivePlayerRole { type: 'RECEIVE_PLAYER_ROLE'; isUndercover: boolean };
interface ReceiveHint{ type: 'RECEIVE_HINT'; hint: string };
interface ReceiveGameResult { type: 'GAME_COMPLETE'; result: boolean };
interface JoinLobbyRequestAction { type: 'JOIN_LOBBY_REQUEST' };
interface JoinLobbyAction { type: 'JOIN_LOBBY'; lobby: string };
interface GameStartedAction { type: 'GAME_STARTED' };
interface LeaveLobbyAction { type: 'LEAVE_LOBBY'; lobby: string };
interface CreateLobbyRequestAction { type: 'CREATE_LOBBY_REQUEST' };
interface FailedJoinLobbyAction { type: 'FAILED_JOIN_LOBBY'; lobby: string };
interface ReturnToLobbyAction { type: 'RETURN_TO_LOBBY'; lobby: string };

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = InitialiseAction | VoteAction | ReceiveVoteResults |
    ReceiveAmbushResults | ReceivePlayerRole | ReceiveHint | ReceiveGameResult |
    JoinLobbyRequestAction | JoinLobbyAction |
    CreateLobbyRequestAction | LeaveLobbyAction |
    FailedJoinLobbyAction | GameStartedAction |
    ReturnToLobbyAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    startListening: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.on('ReceiveDetails', data => {
            dispatch({ type: 'RECEIVE_PLAYER_ROLE', isUndercover: data });
        });
        connection.on('VoteResults', data => {
            dispatch({ type: 'RECEIVE_VOTE_RESULTS', votes: data });
        });
        connection.on('AmbushResult', data => {
            dispatch({ type: 'RECEIVE_AMBUSH_RESULTS', ambushSucceeded: data });
        });
        connection.on('ReceiveHint', data => {
            dispatch({ type: 'RECEIVE_HINT', hint: data });
        });
        connection.on('GameComplete', data => {
            dispatch({ type: 'GAME_COMPLETE', result: data });
        });
        connection.on('FailedJoinLobby', data => {
            dispatch({ type: 'FAILED_JOIN_LOBBY', lobby: data });
        });
        connection.on('JoinedLobby', data => {
            dispatch({ type: 'JOIN_LOBBY', lobby: data });
        });
        connection.on('GameStarted', data => {
            dispatch({ type: 'GAME_STARTED' });
        });
    },
    vote: (lobby: string, direction: Direction): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('ReceiveVote', lobby, direction);
        dispatch({ type: 'VOTE' });
    },
    startGame: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('StartGame', lobby);
        connection.invoke('SendPlayerDetails', lobby);
    },
    joinLobbyRequest: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
            connection.invoke('JoinLobby', lobby);
            dispatch({ type: 'JOIN_LOBBY', lobby });
    },
    createLobbyRequest: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('CreateLobby');
    },
    leaveLobbyRequest: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('LeaveLobby', lobby);
        dispatch({ type: 'LEAVE_LOBBY', lobby });
    },
    returnToLobby: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RETURN_TO_LOBBY', lobby });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<DeceptionState> = (state: DeceptionState, action: KnownAction) => {
    switch (action.type) {
        case 'RECEIVE_PLAYER_ROLE':
            return {
                ...state,
                game: {
                    ...state.game,
                    isUndercover: action.isUndercover,
                    gameOver: false
                }
            };
        case 'RECEIVE_AMBUSH_RESULTS':
            return {
                ...state,
                game: {
                    ...state.game,
                    ambushWasSuccess: action.ambushSucceeded,
                    roundsCompleted: state.game.roundsCompleted + 1,
                    hasVotedThisRound: false
                }
            };
        case 'RECEIVE_VOTE_RESULTS':
            return {
                ...state,
                game: {
                    ...state.game,
                    voteResult: action.votes
                }
            };
        case 'VOTE':
            return {
                ...state,
                game: {
                    ...state.game,
                    hasVotedThisRound: true
                }
            };
        case 'INITIALISE':
            return {
                ...state,
                lobby: {
                    ...state.lobby,
                    lobbyCode: action.lobby
                }
            }
        case 'GAME_COMPLETE':
            return {
                ...state,
                game: {
                    ...state.game,
                    gameResult: action.result,
                    gameOver: true
                }
            }
        case 'RECEIVE_HINT':
            return {
                ...state,
                game: {
                    ...state.game,
                    hint: action.hint
                }
            }
        case 'JOIN_LOBBY':
            if (state.lobby.hasJoinedLobby) {
                return state;
            }
            return {
                ...state,
                lobby: {
                    lobbyCode: action.lobby,
                    hasJoinedLobby: true
                }
            };
        case 'CREATE_LOBBY_REQUEST':
            return state;
        case 'JOIN_LOBBY_REQUEST':
            return state;
        case 'LEAVE_LOBBY':
            if (action.lobby == state.lobby.lobbyCode) {
                return unloadedState;
            }
            return state;
        case 'FAILED_JOIN_LOBBY':
            if (action.lobby != state.lobby.lobbyCode) {
                return state;
            }
            return unloadedState;
        case 'GAME_STARTED':
            return {
                ...state,
                gameHasStarted: true
            }
        case 'RETURN_TO_LOBBY':
            return {
                ...unloadedState,
                lobby: {
                    ...state.lobby
                }
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || unloadedState;
};
