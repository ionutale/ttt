import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { retryAIMove } from '$lib/server/game';

export const POST: RequestHandler = async () => {
	try {
		const state = await retryAIMove();
		return json(state);
	} catch (e) {
		return json({
			error: e instanceof Error ? e.message : 'Retry failed',
		}, { status: 500 });
	}
};
