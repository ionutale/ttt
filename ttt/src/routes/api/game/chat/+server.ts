import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getState } from '$lib/server/game';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();
	const state = getState();

	if (!state.gameActive || state.mode !== 'ai') {
		return json({ reply: 'No active AI game.' });
	}

	const humanPlayer = state.aiPlayer === 'X' ? 'O' : 'X';
	const opponent = state.aiPlayer;
	const lastMove = state.history.length > 0 ? state.history[state.history.length - 1] : null;

	let gameSummary = `Board: 20x20, win by getting 4 in a row.\n`;
	gameSummary += `You play as ${opponent}. The human plays as ${humanPlayer}.\n`;
	if (state.winner) {
		gameSummary += state.winner === 'draw'
			? 'The game ended in a draw.'
			: `${state.winner} won the game.`;
	} else {
		gameSummary += `Current turn: ${state.currentPlayer}.`;
		if (lastMove) {
			const row = Math.floor(lastMove.index / 20) + 1;
			const col = (lastMove.index % 20) + 1;
			const who = lastMove.player === opponent ? 'You' : 'The human';
			gameSummary += ` Last move: ${who} played at (${row}, ${col}).`;
		}
	}

	const prompt = [
		`You are an AI playing Tic Tac Toe against a human. You are in character as a cocky, witty trash-talking opponent.`,
		``,
		`Game context:`,
		gameSummary,
		``,
		`The human trash-talks you: "${message}"`,
		``,
		`Respond with a short, funny, cocky trash-talk reply (1-2 sentences). Be creative but keep it brief.`
	].join('\n');

	try {
		const res = await fetch(OLLAMA_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: state.aiModel || 'gemma4',
				messages: [{ role: 'user', content: prompt }],
				stream: false,
				options: { temperature: 0.7, num_predict: 60 }
			})
		});

		if (!res.ok) {
			return json({ reply: 'Nice try, but my mic is off. (Ollama error)' });
		}

		const data = await res.json();
		const reply: string = data.message?.content?.trim() || '...';

		return json({ reply });
	} catch {
		return json({ reply: 'You\'ll have to do better than that. (Ollama not responding)' });
	}
};
