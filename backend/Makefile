format:
	uv run black . && uv run isort . 

lint:
	uv run ruff check

type:
	uv run pyrefly check

check: format lint

seed:
	uv run python -m src.database.seed

test:
	uv run pytest --cache-clear