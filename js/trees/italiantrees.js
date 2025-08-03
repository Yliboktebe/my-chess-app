export const italianTree = {
  id: "start",
  move: "Bc5",
  fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  comment: "Чёрные симметрично развиваются, готовясь к рокировке.",
  lineName: "Итальянская партия — основная линия",
  end: false,
  replies: [
    {
      id: "start-1",
      move: "c3",
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
      comment: "Белые подготавливают d4, захватывая центр.",
      end: false,
      replies: [
        {
          id: "start-1-1",
          move: "Nf6",
          fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5",
          comment: "Чёрные развивают коня и оказывают давление на пешку e4.",
          end: false,
          replies: [
            {
              id: "start-1-1-1",
              move: "d4",
              fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5",
              comment: "Белые реализуют центральный прорыв.",
              end: false,
              replies: []
            }
          ]
        }
      ]
    }
  ]
};
