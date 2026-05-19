import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const res = await fetch('http://localhost:11434/api/tags');
		if (!res.ok) {
			return json({ models: [] });
		}
		const data = await res.json();
		const models: string[] = (data.models || []).map(
			(m: { name: string }) => m.name
		);
		return json({ models });
	} catch {
		return json({ models: [] });
	}
};
