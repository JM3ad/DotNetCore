import { Reducer} from 'redux';
import { AppThunkAction } from '.';
import { connection } from '../configureStore';
import * as Lobby from './Lobby';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.
export enum Direction {
    North = 1,
    East,
    South,
    West
}

export enum Stage {
    Voting,
    WaitingForVotes,
    WaitingForResults,
    GameComplete
}

export interface DeceptionState {
    gameHasStarted: boolean,
    game: DeceptionGameState,
    lobby: Lobby.LobbyState
}

interface DeceptionGameState {
    isUndercover: boolean,
    voteResult: Direction[],
    ambushWasSuccess: boolean,
    roundsCompleted: number,
    hasVotedThisRound: boolean,
    hint: string,
    stage: Stage,
    gameResult: boolean,
    gameOver: boolean
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
        stage: Stage.Voting,
        gameResult: false,
        gameOver: false
    },
    lobby: Lobby.unloadedState
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
interface GameStartedAction { type: 'GAME_STARTED' };
interface ReturnToLobbyAction { type: 'RETURN_TO_LOBBY'; lobby: string };
interface DispatchLobbyAction { type: 'LOBBY_ACTION'; action: Lobby.KnownLobbyAction };

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = InitialiseAction | VoteAction | ReceiveVoteResults |
    ReceiveAmbushResults | ReceivePlayerRole | ReceiveHint | ReceiveGameResult |
    GameStartedAction | ReturnToLobbyAction | DispatchLobbyAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators = {
    startListening: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        Lobby.startListening((action: Lobby.KnownLobbyAction) => { return dispatch({ type: 'LOBBY_ACTION', action: action })});
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
    },
    returnToLobby: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RETURN_TO_LOBBY', lobby });
    },
    dispatchLobbyChange: (action: Lobby.KnownLobbyAction): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'LOBBY_ACTION', action });
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
            if (state.game.stage != Stage.WaitingForResults) {
                return state;
            }
            return {
                ...state,
                game: {
                    ...state.game,
                    ambushWasSuccess: action.ambushSucceeded,
                    roundsCompleted: state.game.roundsCompleted + 1,
                    hasVotedThisRound: false,
                    stage: Stage.Voting
                }
            };
        case 'RECEIVE_VOTE_RESULTS':
            return {
                ...state,
                game: {
                    ...state.game,
                    voteResult: action.votes,
                    stage: Stage.WaitingForResults
                }
            };
        case 'VOTE':
            return {
                ...state,
                game: {
                    ...state.game,
                    stage: Stage.WaitingForVotes,
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
                    stage: Stage.GameComplete,
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
            };
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
        case 'LOBBY_ACTION':
            return {
                ...state,
                lobby: Lobby.reducer(state.lobby, action.action)
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || unloadedState;
};
