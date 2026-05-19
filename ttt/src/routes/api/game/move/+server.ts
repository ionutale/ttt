import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { makeMove } from '$lib/server/game';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { index } = await request.json();
		const state = await makeMove(index);
		return json(state);
	} catch (e) {
		return json({
			error: e instanceof Error ? e.message : 'Failed to make move',
		}, { status: 500 });
	}
};
