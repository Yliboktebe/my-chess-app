import chess
import chess.pgn
import uuid
import json
import os


def build_tree_iteratively(game, line_name=""):
    """
    Построение дерева ходов без рекурсии, с поддержкой вариаций.
    """
    root_board = game.board()
    stack = []
    root_node = {
        "id": str(uuid.uuid4()),
        "move": None,
        "fen": root_board.fen(),
        "comment": "Начальная позиция",
        "lineName": line_name,
        "end": False,
        "replies": []
    }
    node_map = {game: root_node}
    stack.append((game, root_node, root_board))

    while stack:
        current_game_node, current_json_node, current_board = stack.pop()

        for variation in reversed(current_game_node.variations):
            board_copy = current_board.copy()
            move = variation.move

            try:
                san = board_copy.san(move)
            except:
                continue  # Пропускаем некорректные ходы

            board_copy.push(move)

            new_node = {
                "id": str(uuid.uuid4()),
                "move": san,
                "fen": board_copy.fen(),
                "comment": variation.comment.strip() if variation.comment else "",
                "lineName": line_name,
                "end": len(variation.variations) == 0,
                "replies": []
            }

            current_json_node["replies"].append(new_node)
            stack.append((variation, new_node, board_copy))

    return root_node


def parse_pgn_file(pgn_path, output_path):
    if not os.path.exists(pgn_path):
        print(f"❌ Файл не найден: {pgn_path}")
        return

    with open(pgn_path, encoding="utf-8") as pgn_file:
        game = chess.pgn.read_game(pgn_file)
        if not game:
            print("❌ Не удалось считать PGN.")
            return

        line_name = game.headers.get("Opening", "")
        tree = build_tree_iteratively(game, line_name=line_name)

        with open(output_path, "w", encoding="utf-8") as out_file:
            json.dump(tree, out_file, indent=2, ensure_ascii=False)

        print(f"✅ Парсинг завершён. Файл сохранён в: {output_path}")


# 🚀 Точка входа
if __name__ == "__main__":
    pgn_path = "tools/parsers/central.pgn"
    output_path = "tools/parsers/central.json"
    parse_pgn_file(pgn_path, output_path)
