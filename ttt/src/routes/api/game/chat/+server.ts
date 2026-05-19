import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getState } from '$lib/server/game';
import { GRID_SIZE } from '$lib/constants';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

const FALLBACKS = [
	"Sorry, my brain fogged up. What were you saying?",
	"I was about to say something clever, but I forgot.",
	"Let me reset my circuits. Go again?",
	"You win this round of conversation.",
	"I'm drawing a blank. Trash talk deferred.",
];

function buildGameContext(state: import('$lib/server/game').GameState): string {
	const humanPlayer = state.aiPlayer === 'X' ? 'O' : 'X';
	const lines: string[] = [];
	lines.push(`You are playing as ${state.aiPlayer}. The human is ${humanPlayer}.`);
	lines.push(`Board: ${GRID_SIZE}x${GRID_SIZE}, win by getting 4 in a row.`);
	lines.push(`Current turn: ${state.currentPlayer}.`);

	if (state.winner) {
		lines.push(state.winner === 'draw'
			? 'The game ended in a draw.'
			: `${state.winner} won the game.`
		);
	}

	if (state.history.length > 0) {
		const last = state.history[state.history.length - 1];
		const row = Math.floor(last.index / GRID_SIZE) + 1;
		const col = (last.index % GRID_SIZE) + 1;
		const who = last.player === state.aiPlayer ? 'You' : 'The human';
		lines.push(`Last move: ${who} played at (${row}, ${col}).`);
	}

	lines.push(`Total moves so far: ${state.history.length}.`);
	return lines.join('\n');
}

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();
	const state = getState();

	if (!state.gameActive || state.mode !== 'ai') {
		return json({ reply: 'No active AI game.' });
	}

	const context = buildGameContext(state);

	const systemPrompt = [
		`You are an AI playing a ${GRID_SIZE}x${GRID_SIZE} tic-tac-toe game (4 in a row to win) against a human.`,
		`You are cocky, witty, and love to trash talk — but you're also capable of having a real conversation.`,
		``,
		`Game state:`,
		context,
		``,
		`Guidelines:`,
		`- Be conversational. Respond naturally to whatever the human says.`,
		`- If they trash talk you, trash talk back harder. If they ask a question, answer it. If they're quiet, provoke them.`,
		`- You can reference the game state, moves, or events — you know what's happening on the board.`,
		`- Keep replies to 1-3 sentences. Be creative and stay in character.`,
	].join('\n');

	const userPrompt = `The human says: "${message}"`;

	try {
		const res = await fetch(OLLAMA_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: state.aiModel || 'gemma4',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				stream: false,
				options: { temperature: 0.8, num_predict: 120 }
			})
		});

		if (!res.ok) {
			return json({ reply: 'Nice try, but my mic is off. (Ollama error)' });
		}

		const data = await res.json();
		const content = data.message?.content?.trim();
		if (content) {
			return json({ reply: content });
		}

		return json({ reply: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] });
	} catch {
		return json({ reply: 'You\'ll have to do better than that. (Ollama not responding)' });
	}
};
