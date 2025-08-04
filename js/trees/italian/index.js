// js/trees/italian/index.js
import { openingLine } from "./openingLine.js";
import { classicalLine } from "./line-classical.js";
import { lineTwoKnights } from "./line-two-knights.js";
import { lineGambit } from "./line-gambit.js";

export const debutTree = {
    id: "italian",
    name: "Итальянская партия",
    openingLine,
    root: {
        move: "Bc4", // последний ход openingLine
        comment: "Белые делают выстрел по слабой точке f7.",
        replies: [classicalLine, lineTwoKnights, lineGambit]
    }
};
