import { openingLine } from "./openingLine.js";
import { lineClassical } from "./line-classical.js";
import { lineTwoKnights } from "./line-two-knights.js";
import { lineGambit } from "./line-gambit.js";

export const debutTree = {
    id: "italian",
    name: "Итальянская партия",
    openingLine,
    root: {
        move: "Bc4",
        comment: "Белые делают выстрел по слабой точке f7.",
        replies: [lineClassical, lineTwoKnights, lineGambit]
    }
};
