type Player = 'X' | 'O';
type Cell = Player | null;

const WINNING_COMBOS = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8],
	[0, 3, 6], [1, 4, 7], [2, 5, 8],
	[0, 4, 8], [2, 4, 6]
];

function createGame() {
	let board = $state<Cell[]>(Array(9).fill(null));
	let currentPlayer = $state<Player>('X');
	let winner = $state<Player | 'draw' | null>(null);

	function makeMove(index: number) {
		if (board[index] !== null || winner !== null) return;
		board[index] = currentPlayer;
		if (checkWin(currentPlayer)) {
			winner = currentPlayer;
		} else if (board.every((cell) => cell !== null)) {
			winner = 'draw';
		} else {
			currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
		}
	}

	function checkWin(player: Player): boolean {
		return WINNING_COMBOS.some((combo) => combo.every((i) => board[i] === player));
	}

	function reset() {
		board = Array(9).fill(null);
		currentPlayer = 'X';
		winner = null;
	}

	return {
		get board() { return board; },
		get currentPlayer() { return currentPlayer; },
		get winner() { return winner; },
		makeMove,
		reset
	};
}

export const game = createGame();
