import { Reducer } from 'redux';
import { connection } from '../configureStore';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LobbyState {
    callbackHandler: (action: KnownLobbyAction) => void,
    lobbyCode: string,
    name: string,
    players: string[],
    hasJoinedLobby: boolean
}

export const unloadedState: LobbyState = {
    callbackHandler: () => {},
    lobbyCode: '',
    name: '',
    players: [],
    hasJoinedLobby: false
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface JoinLobbyRequestAction { type: 'JOIN_LOBBY_REQUEST'; lobby: string };
interface JoinLobbyAction { type: 'JOIN_LOBBY'; lobby: string };
interface LeaveLobbyAction { type: 'LEAVE_LOBBY'; lobby: string };
interface CreateLobbyRequestAction { type: 'CREATE_LOBBY_REQUEST' };
interface FailedJoinLobbyAction { type: 'FAILED_JOIN_LOBBY'; lobby: string };
interface StartGameAction { type: 'START_GAME'; lobby: string };
interface UpdatePlayersAction { type: 'UPDATE_PLAYERS'; players: string[] };
interface SetNameAction { type: 'SET_NAME'; name: string };

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownLobbyAction = JoinLobbyRequestAction | JoinLobbyAction |
    CreateLobbyRequestAction | LeaveLobbyAction | FailedJoinLobbyAction |
    StartGameAction | UpdatePlayersAction | SetNameAction;

export function startListening(dispatch: (action: KnownLobbyAction)=>void) {
    connection.on('FailedJoinLobby', data => {
        dispatch({ type: 'FAILED_JOIN_LOBBY', lobby: data });
    });
    connection.on('JoinedLobby', data => {
        dispatch({ type: 'JOIN_LOBBY', lobby: data });
    });
    connection.on('UpdatedPlayerList', data => {
        dispatch({ type: 'UPDATE_PLAYERS', players: data });
    });
}

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<LobbyState> = (state: LobbyState, action: KnownLobbyAction) => {
    switch (action.type) {
        case 'JOIN_LOBBY':
            if (state.hasJoinedLobby) {
                return state;
            }
            return {
                ...state,
                lobbyCode: action.lobby,
                hasJoinedLobby: true
            };
        case 'CREATE_LOBBY_REQUEST':
            connection.invoke('CreateLobby', state.name);
            return state;
        case 'JOIN_LOBBY_REQUEST':
            connection.invoke('JoinLobby', action.lobby, state.name);
            return state;
        case 'LEAVE_LOBBY':
            connection.invoke('LeaveLobby', action.lobby);
            if (action.lobby == state.lobbyCode) {
                return unloadedState;
            }
            return state;
        case 'FAILED_JOIN_LOBBY':
            if (action.lobby != state.lobbyCode) {
                return state;
            }
            return unloadedState;
        case 'START_GAME':
            connection.invoke('StartGame', action.lobby);
            connection.invoke('SendPlayerDetails', action.lobby);
            return state;
        case 'UPDATE_PLAYERS':
            return {
                ...state,
                players: action.players
            }
        case 'SET_NAME':
            return {
                ...state,
                name: action.name
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || unloadedState;
};
