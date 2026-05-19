import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startGame, startGameWithAI, getState } from '$lib/server/game';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { mode, aiPlayer, aiModel } = await request.json();
		startGame(mode, aiPlayer, aiModel);

		if (mode === 'ai' && aiPlayer === 'X') {
			await startGameWithAI();
		}

		return json(getState());
	} catch (e) {
		return json({
			error: e instanceof Error ? e.message : 'Failed to start game',
			board: [],
			currentPlayer: 'X',
			winner: null,
			mode: 'pvp',
			aiPlayer: 'O',
			aiModel: '',
			gameActive: false,
		}, { status: 500 });
	}
};
