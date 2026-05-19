import { GRID_SIZE } from '$lib/constants';

type Player = 'X' | 'O';

interface ChatMessage {
	role: 'human' | 'ai';
	text: string;
}

interface HistoryEntry {
	player: Player;
	index: number;
	timestamp: string;
	durationMs: number | null;
}

interface GameState {
	board: (Player | null)[];
	currentPlayer: Player;
	winner: Player | 'draw' | null;
	mode: 'pvp' | 'ai';
	aiPlayer: Player;
	aiModel: string;
	gameActive: boolean;
	error: string | null;
	history: HistoryEntry[];
	lastTrashTalk: string | null;
}

const EMPTY_BOARD = Array(GRID_SIZE * GRID_SIZE).fill(null) as (Player | null)[];

function defaultState(): GameState {
	return {
		board: [],
		currentPlayer: 'X',
		winner: null,
		mode: 'pvp',
		aiPlayer: 'O',
		aiModel: '',
		gameActive: false,
		error: null,
		history: [],
		lastTrashTalk: null,
	};
}

	function createGame() {
	let state = $state<GameState>(defaultState());
	let loading = $state(false);
	let chatMessages = $state<ChatMessage[]>([]);

	async function startGame(mode: 'pvp' | 'ai', aiPlayer?: Player, aiModel?: string) {
		state = {
			board: [...EMPTY_BOARD],
			currentPlayer: 'X',
			winner: null,
			mode,
			aiPlayer: aiPlayer ?? 'O',
			aiModel: aiModel ?? '',
			gameActive: true,
			error: null,
			history: [],
			lastTrashTalk: null,
		};
		loading = true;
		try {
			const res = await fetch('/api/game/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mode, aiPlayer, aiModel })
			});
			const data = await res.json();
			if (res.ok) {
				state = data;
			} else {
				state = { ...state, error: data.error || 'Failed to start game' };
			}
		} catch {
			state = { ...state, error: 'Failed to connect to server' };
		} finally {
			loading = false;
		}
	}

	async function makeMove(index: number) {
		if (state.board[index] !== null || state.winner !== null) return;
		loading = true;
		try {
			const res = await fetch('/api/game/move', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ index })
			});
			const data = await res.json();
			if (res.ok) {
				state = data;
			} else {
				state = { ...state, error: data.error || 'Move failed' };
			}
		} catch {
			state = { ...state, error: 'Failed to connect to server' };
		} finally {
			loading = false;
		}
	}

	async function retryAIMove() {
		loading = true;
		try {
			const res = await fetch('/api/game/retry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();
			if (res.ok) {
				state = data;
			} else {
				state = { ...state, error: data.error || 'Retry failed' };
			}
		} catch {
			state = { ...state, error: 'Failed to connect to server' };
		} finally {
			loading = false;
		}
	}

	function addTrashTalk(text: string) {
		chatMessages = [...chatMessages, { role: 'ai', text: `*${text}*` }];
	}

	async function sendChatMessage(text: string) {
		chatMessages = [...chatMessages, { role: 'human', text }];
		try {
			const res = await fetch('/api/game/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: text })
			});
			const data = await res.json();
			chatMessages = [...chatMessages, { role: 'ai', text: data.reply }];
		} catch {
			chatMessages = [...chatMessages, { role: 'ai', text: '...' }];
		}
	}

	function quitGame() {
		state = defaultState();
		chatMessages = [];
	}

	return {
		get board() { return state.board; },
		get currentPlayer() { return state.currentPlayer; },
		get winner() { return state.winner; },
		get mode() { return state.mode; },
		get aiPlayer() { return state.aiPlayer; },
		get aiModel() { return state.aiModel; },
		get gameActive() { return state.gameActive; },
		get error() { return state.error; },
		get chatMessages() { return chatMessages; },
		get lastTrashTalk() { return state.lastTrashTalk; },
		get history() { return state.history; },
		get loading() { return loading; },
		startGame,
		makeMove,
		retryAIMove,
		sendChatMessage,
		addTrashTalk,
		quitGame,
	};
}

export const game = createGame();
export { GRID_SIZE };
