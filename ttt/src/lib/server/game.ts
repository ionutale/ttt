import { readFileSync } from 'fs';
import { join } from 'path';
import { GRID_SIZE, WIN_LENGTH, TOTAL_CELLS } from '$lib/constants';

type Player = 'X' | 'O';
type Cell = Player | null;

export interface HistoryEntry {
	player: Player;
	index: number;
	timestamp: string;
	durationMs: number | null;
}

export interface GameState {
	board: Cell[];
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

export const SYSTEM_PROMPT = (() => {
	try {
		const filePath = join(process.cwd(), '../ai-oponent-prompt.md');
		const raw = readFileSync(filePath, 'utf-8');
		const lines = raw.split('\n');
		const lastLine = lines.length > 0 ? lines[lines.length - 1].trim() : '';
		if (lastLine === '' || lastLine.startsWith('Understood?')) {
			return lines.slice(0, -1).join('\n').trim();
		}
		return raw.trim();
	} catch {
		return 'You are an expert AI opponent playing Tic Tac Toe on a 20x20 board with 5-in-a-row win condition.';
	}
})();

const WINNING_COMBOS = generateWinCombos();
let processing = false;
let turnStartedAt = Date.now();

function recordMove(player: Player, index: number, durationMs: number | null): void {
	state.history = [...state.history, {
		player,
		index,
		timestamp: new Date().toISOString(),
		durationMs,
	}];
}

let state: GameState = {
	board: Array(TOTAL_CELLS).fill(null),
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

function generateWinCombos(): number[][] {
	const combos: number[][] = [];
	for (let row = 0; row < GRID_SIZE; row++) {
		for (let col = 0; col <= GRID_SIZE - WIN_LENGTH; col++) {
			const combo: number[] = [];
			for (let k = 0; k < WIN_LENGTH; k++) combo.push(row * GRID_SIZE + col + k);
			combos.push(combo);
		}
	}
	for (let col = 0; col < GRID_SIZE; col++) {
		for (let row = 0; row <= GRID_SIZE - WIN_LENGTH; row++) {
			const combo: number[] = [];
			for (let k = 0; k < WIN_LENGTH; k++) combo.push((row + k) * GRID_SIZE + col);
			combos.push(combo);
		}
	}
	for (let row = 0; row <= GRID_SIZE - WIN_LENGTH; row++) {
		for (let col = 0; col <= GRID_SIZE - WIN_LENGTH; col++) {
			const combo: number[] = [];
			for (let k = 0; k < WIN_LENGTH; k++) combo.push((row + k) * GRID_SIZE + (col + k));
			combos.push(combo);
		}
	}
	for (let row = 0; row <= GRID_SIZE - WIN_LENGTH; row++) {
		for (let col = WIN_LENGTH - 1; col < GRID_SIZE; col++) {
			const combo: number[] = [];
			for (let k = 0; k < WIN_LENGTH; k++) combo.push((row + k) * GRID_SIZE + (col - k));
			combos.push(combo);
		}
	}
	return combos;
}

function checkWin(player: Player): boolean {
	return WINNING_COMBOS.some((combo) => combo.every((i) => state.board[i] === player));
}

function cloneState(): GameState {
	return {
		board: [...state.board],
		currentPlayer: state.currentPlayer,
		winner: state.winner,
		mode: state.mode,
		aiPlayer: state.aiPlayer,
		aiModel: state.aiModel,
		gameActive: state.gameActive,
		error: state.error,
		history: state.history,
		lastTrashTalk: state.lastTrashTalk,
	};
}

function buildBoardText(): string {
	const rows: string[] = [];
	for (let r = 0; r < GRID_SIZE; r++) {
		const cells: string[] = [];
		for (let c = 0; c < GRID_SIZE; c++) {
			cells.push(state.board[r * GRID_SIZE + c] ?? '.');
		}
		const rowNum = (r + 1).toString().padStart(2);
		rows.push(`Row ${rowNum}: ${cells.join(' ')}`);
	}
	return rows.join('\n');
}

function evaluateMove(index: number, player: Player): number {
	const opponent: Player = player === 'X' ? 'O' : 'X';
	let score = 0;
	let proximityCount = 0;

	const row = Math.floor(index / GRID_SIZE);
	const col = index % GRID_SIZE;
	for (let dr = -1; dr <= 1; dr++) {
		for (let dc = -1; dc <= 1; dc++) {
			if (dr === 0 && dc === 0) continue;
			const nr = row + dr;
			const nc = col + dc;
			if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
				const neighbor = state.board[nr * GRID_SIZE + nc];
				if (neighbor !== null) proximityCount++;
			}
		}
	}
	score += proximityCount * 2;

	for (const combo of WINNING_COMBOS) {
		if (!combo.includes(index)) continue;
		let countAI = 0;
		let countOpp = 0;
		let emptySlots = 0;
		for (const ci of combo) {
			if (ci === index) { emptySlots++; continue; }
			if (state.board[ci] === player) countAI++;
			else if (state.board[ci] === opponent) countOpp++;
			else emptySlots++;
		}
		if (countAI > 0 && countOpp > 0) continue;
		if (countAI === 3 && emptySlots === 1) score += 100_000;
		else if (countOpp === 3 && emptySlots === 1) score += 50_000;
		else if (countAI === 2 && emptySlots >= 1) score += 1_000;
		else if (countOpp === 2 && emptySlots >= 1) score += 500;
		else if (countAI === 1 && emptySlots >= 1) score += 100;
		else if (countOpp === 1 && emptySlots >= 1) score += 50;
		else if (countAI === 0 && countOpp === 0 && emptySlots >= 1) score += 10;
	}
	return score;
}

function findBestMove(): number {
	const ai = state.currentPlayer;
	let bestIdx = -1;
	let bestScore = -Infinity;
	for (let i = 0; i < TOTAL_CELLS; i++) {
		if (state.board[i] !== null) continue;
		const s = evaluateMove(i, ai);
		if (s > bestScore) { bestScore = s; bestIdx = i; }
	}
	return bestIdx;
}

async function generateTrashTalk(): Promise<string> {
	try {
		const res = await fetch('http://localhost:11434/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: state.aiModel || 'gemma4',
				messages: [{
					role: 'user',
					content: 'Generate a single cocky, creative trash-talk taunt (max 15 words) as if you are crushing a human opponent at a board game. Just the taunt, no quotes, no explanation.'
				}],
				stream: false,
				options: { temperature: 0.9, num_predict: 30 }
			})
		});
		if (res.ok) {
			const data = await res.json();
			const text = data.message?.content?.trim();
			if (text) return text.replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '');
		}
	} catch {}
	return "Out of words? I'm not surprised.";
}

function boardAdvantage(ai: Player): 'ahead' | 'behind' | 'close' {
	const human: Player = ai === 'X' ? 'O' : 'X';
	let aiThreats = 0;
	let humanThreats = 0;
	for (const combo of WINNING_COMBOS) {
		let aiCount = 0, humanCount = 0;
		for (const ci of combo) {
			if (state.board[ci] === ai) aiCount++;
			else if (state.board[ci] === human) humanCount++;
		}
		if (aiCount > 0 && humanCount > 0) continue;
		if (aiCount >= 3) aiThreats += aiCount * 10;
		else if (aiCount >= 2) aiThreats += aiCount * 2;
		if (humanCount >= 3) humanThreats += humanCount * 10;
		else if (humanCount >= 2) humanThreats += humanCount * 2;
	}
	if (humanThreats > aiThreats * 1.3) return 'behind';
	if (aiThreats > humanThreats * 1.3) return 'ahead';
	return 'close';
}

async function callOllama(): Promise<{ index: number; trashTalk: string }> {
	const player = state.currentPlayer;
	const opponent: Player = player === 'X' ? 'O' : 'X';

	const smartMove = findBestMove();
	const smartScore = smartMove >= 0 ? evaluateMove(smartMove, player) : 0;

	const advantage = boardAdvantage(player);
	const trashTone = advantage === 'behind'
		? `The human is currently winning. Sound frustrated, humbled, desperate — like you're struggling to keep up.`
		: advantage === 'ahead'
			? `You are winning. Sound cocky, arrogant, like you're toying with them.`
			: `The game is close. Sound determined and confident — respectful but still trash-talking.`;

	const boardText = buildBoardText();
	const userMessage = [
		`Current board (20x20, 5-in-a-row):`,
		boardText,
		``,
		`You are ${player}. Opponent is ${opponent}.`,
		`${advantage === 'behind' ? 'You are losing.' : advantage === 'ahead' ? 'You are winning.' : 'The game is close.'}`,
		``,
		`STRATEGIC THINKING:`,
		`- Look for 5-in-a-row patterns: horizontal, vertical, both diagonals.`,
		`- Prioritize extending your own lines and blocking your opponent's lines.`,
		`- Play near your existing pieces to build connections.`,
		`- Control the center and build in multiple directions.`,
		``,
		`Output exactly two lines:`,
		`My Move: (Row, Col)`,
		`Trash Talk: <one-liner>`,
		``,
		`Trash Talk tone: ${trashTone}`,
		`Both lines are MANDATORY. Be creative — make it fresh, not generic.`
	].join('\n');

	const res = await fetch('http://localhost:11434/api/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: state.aiModel || 'gemma4',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userMessage }
			],
			stream: false,
			options: { temperature: 0.7, num_predict: 100 }
		})
	});

	if (!res.ok) {
		throw new Error(`Ollama responded with status ${res.status}`);
	}

	const data = await res.json();
	const content: string = data.message?.content || '';

	const parsed = tryParseResponse(content);
	if (parsed !== null) {
		const parsedScore = evaluateMove(parsed.index, player);
		if (parsedScore >= Math.max(smartScore * 0.5, 100)) {
			return parsed;
		}
		return { index: smartMove >= 0 ? smartMove : findFallbackMove(), trashTalk: parsed.trashTalk };
	}

	const trashTalk = await generateTrashTalk();
	return { index: smartMove >= 0 ? smartMove : findFallbackMove(), trashTalk };
}

function tryParseResponse(text: string): { index: number; trashTalk: string } | null {
	const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
	const trashMatch = text.match(/Trash[\s-]?Talk:\s*(.+?)$/im);
	const trashTalk: string | null = trashMatch
		? trashMatch[1].trim().replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '')
		: lines.length > 1
			? lines[lines.length - 1].replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '')
			: null;

	const moveMatch = text.match(/My Move:\s*\((\d+)\s*,\s*(\d+)\)/i);
	if (moveMatch) {
		const row = parseInt(moveMatch[1], 10) - 1;
		const col = parseInt(moveMatch[2], 10) - 1;
		const index = row * GRID_SIZE + col;
		if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE && state.board[index] === null) {
			return { index, trashTalk };
		}
	}

	const coordMatch = text.match(/\((\d+)\s*,\s*(\d+)\)/);
	if (coordMatch) {
		const row = parseInt(coordMatch[1], 10) - 1;
		const col = parseInt(coordMatch[2], 10) - 1;
		const index = row * GRID_SIZE + col;
		if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE && state.board[index] === null) {
			return { index, trashTalk };
		}
	}

	const flatNums = [...text.matchAll(/\b\d+\b/g)].map((m) => parseInt(m[0], 10));
	for (const num of flatNums) {
		const idx = num - 1;
		if (idx >= 0 && idx < TOTAL_CELLS && state.board[idx] === null) {
			return { index: idx, trashTalk };
		}
	}

	return null;
}

function findFallbackMove(): number {
	const empty: number[] = [];
	for (let i = 0; i < TOTAL_CELLS; i++) {
		if (state.board[i] === null) empty.push(i);
	}
	return empty[Math.floor(Math.random() * empty.length)];
}

async function triggerAIMove(): Promise<void> {
	processing = true;
	state.error = null;
	state.lastTrashTalk = null;
	const aiStart = Date.now();
	try {
		const { index: aiIndex, trashTalk } = await callOllama();

		if (aiIndex < 0 || aiIndex >= TOTAL_CELLS || state.board[aiIndex] !== null) {
			throw new Error('AI returned an invalid move');
		}

		const durationMs = Date.now() - aiStart;
		state.board[aiIndex] = state.currentPlayer;
		state.lastTrashTalk = trashTalk;
		recordMove(state.currentPlayer, aiIndex, durationMs);
		turnStartedAt = Date.now();

		if (checkWin(state.currentPlayer)) {
			state.winner = state.currentPlayer;
		} else if (state.board.every((cell) => cell !== null)) {
			state.winner = 'draw';
		} else {
			state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
		}
	} catch (e) {
		state.error = e instanceof Error ? e.message : 'AI failed to respond';
	} finally {
		processing = false;
	}
}

export function getState(): GameState {
	return cloneState();
}

export function startGame(mode: 'pvp' | 'ai', aiPlayer?: Player, aiModel?: string): GameState {
	state = {
		board: Array(TOTAL_CELLS).fill(null),
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
	turnStartedAt = Date.now();

	return cloneState();
}

export async function startGameWithAI(): Promise<GameState> {
	if (state.mode === 'ai' && state.aiPlayer === 'X') {
		await triggerAIMove();
	}
	return cloneState();
}

export async function makeMove(index: number): Promise<GameState> {
	if (!state.gameActive || processing || state.winner) return cloneState();
	if (state.board[index] !== null) return cloneState();

	const durationMs = Date.now() - turnStartedAt;
	state.board[index] = state.currentPlayer;
	recordMove(state.currentPlayer, index, durationMs);
	turnStartedAt = Date.now();

	if (checkWin(state.currentPlayer)) {
		state.winner = state.currentPlayer;
		return cloneState();
	}
	if (state.board.every((cell) => cell !== null)) {
		state.winner = 'draw';
		return cloneState();
	}

	state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';

	if (state.mode === 'ai' && state.currentPlayer === state.aiPlayer) {
		await triggerAIMove();
	}

	return cloneState();
}

export async function retryAIMove(): Promise<GameState> {
	if (!state.gameActive || state.winner) return cloneState();
	if (state.error || (state.mode === 'ai' && state.currentPlayer === state.aiPlayer)) {
		await triggerAIMove();
	}
	return cloneState();
}
