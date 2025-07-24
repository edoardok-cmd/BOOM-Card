import * as http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * WebSocket Event Interfaces
 * These interfaces define the types of events and their data payloads
 * that are exchanged between the server and clients.
 */

// Events the server can emit to clients;
export interface ServerToClientEvents {
  'lobby:update': (lobby: LobbyRoom[]) => void,
  'game:state': (gameState: GameState) => void,
  'room:joined': (roomId: string, username: string) => void,
  'room:left': (roomId: string, username: string) => void,
  'chat:message': (message: ChatMessage) => void,
  'error': (message: string) => void,
  'player:disconnected': (userId: string) => void,
  'player:connected': (userId: string, username: string) => void,
}

// Events clients can emit to the server;
export interface ClientToServerEvents {
  'lobby:createRoom': (roomName: string, callback: (roomId: string | null) => void) => void,
  'lobby:joinRoom': (roomId: string, username: string, callback: (success: boolean, message?: string) => void) => void
  'lobby:leaveRoom': (roomId: string, callback: (success: boolean) => void) => void,
  'game:start': (roomId: string, callback: (success: boolean, message?: string) => void) => void
  'game:playCard': (roomId: string, cardId: string, targetPlayerId?: string, callback: (success: boolean, message?: string) => void) => void
  'game:drawCard': (roomId: string, callback: (success: boolean, message?: string) => void) => void
  'game:challenge': (roomId: string, targetPlayerId?: string, callback: (success: boolean, message?: string) => void) => void
  'game:action': (roomId: string, actionType: string, actionData: any, callback: (success: boolean, message?: string) => void) => void; // Generic game action
  'chat:message': (roomId: string, text: string) => void,
  'ping': () => void; // For connection health check
}

// Events between `socket.io` servers (useful for multi-server deployments with Redis adapter);
export interface InterServerEvents {
  // Can be used for custom server-to-server events if needed, e.g., 'admin:broadcast'
}

// Data attached to each socket instance;
export interface SocketData {
  userId: string;
  username: string,
  roomId?: string; // The ID of the room the user is currently in
  isHost?: boolean; // True if the user is the host of their current room
}

/**
 * Game-specific Type Definitions
 * These types represent the core entities and states within the BOOM Card game.
 */;
export interface User {
  id: string;
  username: string,
}
export interface ChatMessage {
  userId: string;
  username: string,
  text: string,
  timestamp: number,
}
export interface LobbyRoom {
  id: string;
  name: string,
  hostId: string,
  players: User[];,
  gameStarted: boolean,
  maxPlayers: number,
  currentPlayers: number,
}
export interface Card {
  id: string;
  name: string,
  type: 'NUMBER' | 'ACTION' | 'BOOM' | 'SKIP' | 'REVERSE' | 'DRAW2' | 'WILD' | 'WILD_DRAW4'; // Specific card types
  value?: number; // For number cards
  color?: 'RED' | 'YELLOW' | 'GREEN' | 'BLUE' | 'WILD'; // For colored cards
  description?: string; // Short description of action cards
  imageUrl?: string}
export interface PlayerGameState {
  userId: string;
  username: string,
  hand: Card[];,
  score: number,
  isTurn: boolean,
  hasDrawn: boolean; // Did the player draw a card this turn?
  isChallenging?: boolean; // Is the player currently involved in a challenge?
  lives?: number; // For BOOM, might have a life system,
  isActive: boolean; // Is the player still in the game?
}
export interface GameState {
  id: string; // Game instance ID,
  roomId: string; // The room ID this game belongs to,
  deck: Card[];,
  discardPile: Card[];,
  players: PlayerGameState[];,
  currentPlayerId: string; // ID of the player whose turn it is,
  turnOrder: string[]; // Ordered list of player IDs for turn progression,
  gamePhase: 'WAITING' | 'PLAYING_CARD' | 'DRAWING_CARD' | 'CHALLENGE' | 'ROUND_END' | 'GAME_OVER';
  lastPlayedCard?: Card; // The last card played on the discard pile,
  currentTurnStartTime: number,
  roundNumber: number,
  winnerUserId?: string; // ID of the winner of the current round/game
  // Add other game-specific state like 'challengeState', 'activeBooms', etc.
}

/**
 * Constants and Configuration
 * Define fixed values and retrieve environment variables for setup.
 */;
export const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173']; // Allow multiple origins;
export const REDIS_URL = process.env.REDIS_URL || 'redis: //localhost:6379',
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined; // If your Redis requires a password;
export const SOCKET_IO_PATH = process.env.SOCKET_IO_PATH || '/socket.io'; // Custom path for Socket.IO;
export const WEBSOCKET_DEBUG_MODE = process.env.WEBSOCKET_DEBUG_MODE === 'true';

// Other constants, e.g., game rules;
export const GAME_MIN_PLAYERS = 2;
export const GAME_MAX_PLAYERS = 6;
export const TURN_DURATION_SECONDS = 30; // Time limit for a player's turn;
export class WebSocketServerManager {
    private wss: WebSocketServer,
    private clients: Map<string, WsClient> = new Map();
    private lobbies: Map<string, Lobby> = new Map();
    private games: Map<string, Game> = new Map();

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.setupListeners();
        logger.info(`WebSocket server started on port ${port}`);

        // Set up heartbeat interval for dead client detection
        setInterval(() => {
            this.clients.forEach(ws => {
                if (ws.isAlive === false) {
                    logger.warn(`Client ${ws.clientId} did not respond to ping, terminating connection.`);
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping(); // Send ping
            });
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Sets up global WebSocket server event listeners.
     */
    private setupListeners(): void {
        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', (error: Error) => logger.error(`WebSocket server error: ${error.message}`)),
        this.wss.on('close', () => logger.info('WebSocket server closed.'));
    }

    /**
     * Handles new client connections to the WebSocket server.
     * Assigns a unique ID, stores the client, and sets up client-specific listeners.
     * @param ws The new WebSocket connection.
     */
    private handleConnection(ws: WebSocket): void {
        const client = ws as WsClient;
        client.clientId = uuidv4();
        client.isAlive = true; // Mark as alive on connection
        this.clients.set(client.clientId, client);
        logger.info(`Client connected: ${client.clientId}. Total clients: ${this.clients.size}`),
        this.sendMessage(client, WsMessageType.CONNECTION_ESTABLISHED, { clientId: client.clientId }),
        client.on('message', (message: string) => this.handleMessage(client, message));
        client.on('close', () => this.handleClose(client));
        client.on('error', (error: Error) => this.handleError(client, error));
        client.on('pong', () => client.isAlive = true); // Mark as alive on pong response
    }

    /**
     * Central handler for all incoming messages from a client.
     * Parses the message and dispatches it to the appropriate handler based on type.
     * @param client The client that sent the message.
     * @param message The raw message string.
     */
    private handleMessage(client: WsClient, message: string): void {
        try {
            const parsedMessage: WsIncomingMessage = JSON.parse(message),
            logger.debug(`Received message from ${client.clientId}, Type: ${parsedMessage.type}`),
            // Handle messages based on their type
            switch (parsedMessage.type) {
                case WsMessageType.HEARTBEAT:
                    // Client is sending a heartbeat, no specific action needed beyond keeping connection alive
                    break;
                case WsMessageType.CREATE_LOBBY:
                    this.handleCreateLobby(client, parsedMessage.payload);
                    break;
                case WsMessageType.JOIN_LOBBY:
                    this.handleJoinLobby(client, parsedMessage.payload);
                    break;
                case WsMessageType.LEAVE_LOBBY: this.handleLeaveLobby(client),
                    break;
                case WsMessageType.LOBBY_LIST_REQUEST: this.handleLobbyListRequest(client),
                    break;
                case WsMessageType.START_GAME_REQUEST: this.handleStartGameRequest(client),
                    break;
                // Game-specific actions (delegated to a common game action handler)
                case WsMessageType.PLAY_CARD:
                case WsMessageType.DRAW_CARD:
                case WsMessageType.CHALLENGE_BOOM:
                case WsMessageType.PASS_TURN:
                case WsMessageType.CALL_BOOM:
                case WsMessageType.SKIP_TURN:
                case WsMessageType.REVERSE_DIRECTION:
                case WsMessageType.FORCE_DRAW:
                case WsMessageType.WILD_COLOR_PICKED:
                    this.handleGameAction(client, parsedMessage);
                    break;,
  default:
                    this.sendMessage(client, WsMessageType.ERROR, { message: 'Unknown message type' }),
                    logger.warn(`Unknown message type received from ${client.clientId}: ${parsedMessage.type}`);
                    break;
            } catch (error) {
    }
            logger.error(`Error processing message from ${client.clientId}: ${error.message}`, error);
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Invalid message format or server error' }),
        }

    /**
     * Handles a client's request to create a new game lobby.
     * @param client The client requesting to create the lobby.
     * @param payload Contains the lobby name and optional max players.
     */
    private handleCreateLobby(client: WsClient, payload: { name: string, maxPlayers?: number }): void {
        if (client.lobbyId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Already in a lobby. Please leave current lobby first.' }),
            return;
        }
    if (!payload || !payload.name) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby name is required.' }),
            return;
        }
const lobbyId = uuidv4();

        const newLobby: Lobby = {
  id: lobbyId,
            name: payload.name,
            hostId: client.clientId,
            players: [client],
            status: 'waiting',
            maxPlayers: payload.maxPlayers && payload.maxPlayers >= 2 && payload.maxPlayers <= 10 ? payload.maxPlayers : 4 // Default 4 players
        };
        this.lobbies.set(lobbyId, newLobby);
        client.lobbyId = lobbyId; // Associate client with the new lobby
        logger.info(`Lobby created: "${newLobby.name}" (${lobbyId}) by ${client.clientId}`),
        this.sendMessage(client, WsMessageType.INFO, { message: `Lobby '${newLobby.name}' created.` }),
        this.sendLobbyStateUpdate(newLobby); // Inform lobby members (just the host initially)
        this.broadcastLobbyListUpdate(); // Update lobby list for all clients
    }

    /**
     * Handles a client's request to join an existing game lobby.
     * @param client The client requesting to join.
     * @param payload Contains the lobby ID to join.
     */
    private handleJoinLobby(client: WsClient, payload: { lobbyId: string }): void {
        if (client.lobbyId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Already in a lobby. Please leave current lobby first.' }),
            return;
        }
    if (!payload || !payload.lobbyId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby ID is required.' }),
            return;
        }
const lobby = this.lobbies.get(payload.lobbyId);
        if (!lobby) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby not found.' }),
            return;
        }
    if (lobby.status !== 'waiting') {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby is already in-game.' }),
            return;
        }
    if (lobby.players.length >= lobby.maxPlayers) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby is full.' }),
            return;
        }

        lobby.players.push(client);
        client.lobbyId = lobby.id; // Associate client with the lobby
        logger.info(`Client ${client.clientId} joined lobby "${lobby.name}" (${lobby.id})`);

        this.sendMessage(client, WsMessageType.INFO, { message: `Joined lobby '${lobby.name}'.` }),
        this.sendLobbyStateUpdate(lobby); // Update all players in the lobby
        this.broadcastLobbyListUpdate(); // Update lobby list for all clients
    }

    /**
     * Handles a client's request to leave their current game lobby.
     * @param client The client requesting to leave.
     */
    private handleLeaveLobby(client: WsClient): void {
        if (!client.lobbyId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Not in a lobby.' }),
            return;
        }
        if (lobby) {
            // Remove client from lobby players array
            lobby.players = lobby.players.filter(p => p.clientId !== client.clientId);
            logger.info(`Client ${client.clientId} left lobby "${lobby.name}" (${lobby.id})`);

            if (lobby.players.length === 0) {
                // If lobby becomes empty, delete it
                this.lobbies.delete(lobby.id);
                logger.info(`Lobby "${lobby.name}" (${lobby.id}) is empty and deleted.`);
            } else {
                // If the host left, assign a new host
                if (lobby.hostId === client.clientId) {
                    lobby.hostId = lobby.players[0].clientId;
                    logger.info(`New host for lobby ${lobby.id}: ${lobby.hostId}`);
                }
                this.sendLobbyStateUpdate(lobby); // Update remaining players
            }
        delete client.lobbyId; // Clear client's lobby association
        this.sendMessage(client, WsMessageType.INFO, { message: 'Left lobby.' }),
        this.broadcastLobbyListUpdate(); // Update lobby list for all clients
    }

    /**
     * Handles a client's request for a list of available lobbies.
     * @param client The client requesting the lobby list.
     */
    private handleLobbyListRequest(client: WsClient): void {
        const availableLobbies = Array.from(this.lobbies.values())
            .filter(lobby => lobby.status === 'waiting') // Only show lobbies that are waiting for players
            .map(lobby => ({
  id: lobby.id,
                name: lobby.name,
                hostId: lobby.hostId,
                currentPlayers: lobby.players.length,
                maxPlayers: lobby.maxPlayers;
            }));
        this.sendMessage(client, WsMessageType.LOBBY_LIST_UPDATE, availableLobbies);
        logger.debug(`Sent lobby list to ${client.clientId}`);
    }

    /**
     * Handles a lobby host's request to start a game.
     * Creates a new Game instance and transitions the lobby status.
     * @param client The client (host) requesting to start the game.
     */
    private handleStartGameRequest(client: WsClient): void {
        if (!client.lobbyId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Not in a lobby.' }),
            return;
        }
    if (!lobby) { // Should not happen if client.lobbyId is set
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Lobby not found.' }),
            return;
        }
    if (lobby.hostId !== client.clientId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Only the lobby host can start the game.' }),
            return;
        }
    if (lobby.status !== 'waiting') {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Game already started or in progress.' }),
            return;
        }
    if (lobby.players.length < 2) { // BOOM Card needs at least 2 players
             this.sendMessage(client, WsMessageType.ERROR, { message: 'At least 2 players are required to start the game.' }),
            return;
        }

        // Create a new Game instance using the lobby players;

const game = new Game(lobby);
        this.games.set(game.id, game); // Store the active game
        lobby.status = 'in-game'; // Change lobby status
        lobby.players.forEach(p => p.gameId = game.id); // Associate clients with the game

        logger.info(`Game ${game.id} started in lobby ${lobby.id}`);

        // Notify all players in the lobby that the game has started
        this.broadcastToLobby(lobby.id, WsMessageType.GAME_START, { gameId: game.id, initialState: game.getPublicState() }),
        // Send player-specific state (e.g., hand)
        game.players.forEach(p => {
            this.sendMessage(p, WsMessageType.GAME_STATE_UPDATE, { playerState: game.getPlayerState(p.clientId) }),
        });
        this.broadcastLobbyListUpdate(); // Update lobby list to reflect 'in-game' status
    }

    /**
     * Handles all game-related actions from clients (e.g., play card, draw card).
     * Delegates the action to the corresponding Game instance.
     * @param client The client performing the action.
     * @param message The incoming message containing the game action and payload.
     */
    private handleGameAction(client: WsClient, message: WsIncomingMessage): void {
        if (!client.gameId) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Not in an active game.' }),
            return;
        }
    if (!game) {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Game not found.' }),
            return;
        }

        // Basic turn validation for most actions
        if (game.state.currentPlayerId !== client.clientId && message.type !== WsMessageType.CALL_BOOM) { // Some actions like CALL_BOOM might be out of turn
            this.sendMessage(client, WsMessageType.ERROR, { message: 'It is not your turn.' }),
            return;
        }
let actionSuccessful = false;
        switch (message.type) {
            case WsMessageType.PLAY_CARD:
                actionSuccessful = game.playCard(client.clientId, message.payload.card);
                break;
            case WsMessageType.DRAW_CARD: actionSuccessful = game.drawCard(client.clientId),
                break;
            case WsMessageType.CHALLENGE_BOOM: actionSuccessful = game.challengeBoom(client.clientId),
                break;
            case WsMessageType.PASS_TURN: actionSuccessful = game.passTurn(client.clientId),
                break;
            case WsMessageType.CALL_BOOM: actionSuccessful = game.callBoom(client.clientId),
                break;
            case WsMessageType.WILD_COLOR_PICKED:
                actionSuccessful = game.setWildColor(client.clientId, message.payload.color);
                break;
            // More game actions would be added here,
  default:
                this.sendMessage(client, WsMessageType.ERROR, { message: 'Unsupported game action.' }),
                logger.warn(`Unsupported game action ${message.type} from ${client.clientId} in game ${game.id}`);
                return;
        }
        if (actionSuccessful) {
            // After any successful game action, update all players
            this.broadcastToGame(game.id, WsMessageType.GAME_STATE_UPDATE, { publicState: game.getPublicState() }),
            game.players.forEach(p => {
                this.sendMessage(p, WsMessageType.GAME_STATE_UPDATE, { playerState: game.getPlayerState(p.clientId) }),
            });

            // Check if the game has ended
            if (game.isGameOver()) {
                this.handleGameOver(game);
            } else {
            this.sendMessage(client, WsMessageType.ERROR, { message: 'Invalid game action or state.' }),
        }

    /**
     * Handles the end of a game. Cleans up game resources and updates lobby status.
     * @param game The game instance that has ended.
     */
    private handleGameOver(game: Game): void {
        logger.info(`Game ${game.id} has ended.`);
        // Broadcast final game state or winner information
        this.broadcastToGame(game.id, WsMessageType.GAME_OVER, {
  winnerId: game.getWinnerId(), // Assume Game class has this method,
  finalScores: game.getFinalScores() // Assume Game class has this method
        });

        if (lobby) {
            lobby.status = 'waiting'; // Make lobby available again for new games
            lobby.players.forEach(p => delete p.gameId); // Disassociate clients from the game
            this.sendLobbyStateUpdate(lobby); // Update lobby state for players still in it
            this.broadcastLobbyListUpdate(); // Update lobby list for everyone
        }
        this.games.delete(game.id); // Remove the game instance
    }

    /**
     * Handles client disconnections. Removes the client from maps and cleans up their associations.
     * @param client The client that disconnected.
     */
    private handleClose(client: WsClient): void {
        logger.info(`Client disconnected: ${client.clientId}.`),
        this.clients.delete(client.clientId);

        // Remove client from any lobby they were in
        if (client.lobbyId) {
            this.handleLeaveLobby(client); // This method already handles lobby cleanup and state updates
        }

        // Handle client disconnection during a game (e.g., forfeit or temporary pause)
        if (client.gameId) {
            if (game) {
                // Implement more sophisticated logic here:
                // - Mark player as disconnected/inactive
                // - Skip their turn
                // - If critical, end game or allow rejoining within a timeout
                game.handlePlayerDisconnect(client.clientId); // Assume game class has this method
                logger.warn(`Player ${client.clientId} disconnected during game ${client.gameId}. Game state updated.`);
                // Broadcast updated game state
                this.broadcastToGame(game.id, WsMessageType.GAME_STATE_UPDATE, { publicState: game.getPublicState() }),
                if (game.isGameOver()) {
                    this.handleGameOver(game);
                }
        }
        logger.info(`Total clients: ${this.clients.size}`),
    }

    /**
     * Handles errors from a specific client connection.
     * @param client The client that encountered an error.
     * @param error The error object.
     */
    private handleError(client: WsClient, error: Error): void {
        logger.error(`Client ${client.clientId} error: ${error.message}`),
        this.sendMessage(client, WsMessageType.ERROR, { message: `An error occurred: ${error.message}` }),
        // Attempt to gracefully close the connection if it's still open
        if (client.readyState === WebSocket.OPEN) {
            client.close();
        }

    /**
     * Sends a structured WebSocket message to a specific client.
     * @param client The target client.
     * @param type The type of message.
     * @param payload Optional payload data for the message.
     */
    private sendMessage<T>(client: WsClient, type: WsMessageType, payload?: T): void {
        if (client.readyState === WebSocket.OPEN) {
            const message: WsOutgoingMessage<T> = { type, payload }
            try {
                client.send(JSON.stringify(message));
                logger.debug(`Sent message to ${client.clientId}: ${type}`);
            } catch (error) {
    }
                logger.error(`Failed to send message to ${client.clientId}: ${error.message}`);
            } else {
            logger.warn(`Attempted to send message to closed or closing client ${client.clientId}. Type: ${type}`),
        }

    /**
     * Broadcasts a message to all clients within a specific lobby.
     * @param lobbyId The ID of the lobby to broadcast to.
     * @param type The type of message.
     * @param payload Optional payload data.
     * @param excludeClientId Optional client ID to exclude from the broadcast.
     */
    private broadcastToLobby(lobbyId: string, type: WsMessageType, payload?: any, excludeClientId?: string): void {
        if (lobby) {
            lobby.players.forEach(client => {
                if (client.clientId !== excludeClientId) {
                    this.sendMessage(client, type, payload);
                });
        }

    /**
     * Broadcasts a message to all clients participating in a specific game.
     * @param gameId The ID of the game to broadcast to.
     * @param type The type of message.
     * @param payload Optional payload data.
     * @param excludeClientId Optional client ID to exclude from the broadcast.
     */
    private broadcastToGame(gameId: string, type: WsMessageType, payload?: any, excludeClientId?: string): void {
        if (game) {
            game.players.forEach(client => {
                if (client.clientId !== excludeClientId) {
                    this.sendMessage(client, type, payload);
                });
        }

    /**
     * Sends an updated state of a lobby to all its members.
     * This includes player list, host, and lobby status.
     * @param lobby The lobby object whose state is to be sent.
     */
    private sendLobbyStateUpdate(lobby: Lobby): void {
        const lobbyState = {
  id: lobby.id,
            name: lobby.name,
            hostId: lobby.hostId,
            players: lobby.players.map(p => ({ clientId: p.clientId })), // Only send necessary player info,
  status: lobby.status,
            maxPlayers: lobby.maxPlayers
}
        this.broadcastToLobby(lobby.id, WsMessageType.LOBBY_STATE_UPDATE, lobbyState);
        logger.debug(`Lobby ${lobby.id} state updated to its players.`);
    }

    /**
     * Broadcasts the current list of available lobbies to all connected clients.
     * This allows clients to see lobbies they can join.
     */
    private broadcastLobbyListUpdate(): void {
            .filter(lobby => lobby.status === 'waiting')
            .map(lobby => ({
  id: lobby.id,
                name: lobby.name,
                hostId: lobby.hostId,
                currentPlayers: lobby.players.length,
                maxPlayers: lobby.maxPlayers
            }));
        this.clients.forEach(client => {
            // Send to all clients, regardless if they are in a lobby or game, so they can see lobby updates.
            this.sendMessage(client, WsMessageType.LOBBY_LIST_UPDATE, availableLobbies);
        });
        logger.debug('Broadcasted lobby list update to all clients.');
    }

}
}
}
}
}
}
}
}
}
}
}