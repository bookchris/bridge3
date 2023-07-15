import { Box } from "@mui/material";
import { Seat } from "../../../functions/core";
import { useBoardContext } from "./board";
import { PlayingCard } from "./card";
import { useTableContext } from "./table";

export interface HoldingProps {
  seat: Seat;
}

export function Holding({ seat }: HoldingProps) {
  const { width, hand, handAt } = useBoardContext();
  const { play, playingAs } = useTableContext();
  const margin = width / 13;
  const cards = handAt.getHolding(seat);

  const isPlayer = playingAs === seat;
  const isDummy = handAt.isDummy(seat);

  const paperSx = {
    [Seat.West.toString()]: {
      left: "5%",
      top: "50%",
      transform: "rotate(270deg) translate(-50%)",
      transformOrigin: "top left",
    },
    [Seat.North.toString()]: {
      top: "5%",
      left: "50%",
      transform: "translate(-50%)",
    },
    [Seat.East.toString()]: {
      right: "5%",
      top: "50%",
      transform: "rotate(90deg) translate(50%)",
      transformOrigin: "top right",
    },
    [Seat.South.toString()]: {
      bottom: "5%",
      left: "50%",
      transform: "translate(-50%)",
    },
  }[seat.toString()];

  return (
    <Box sx={{ display: "flex", position: "absolute", zIndex: 1, ...paperSx }}>
      <Box sx={{ mr: `${margin}px` }} />
      {cards?.map((card) => (
        <PlayingCard
          enabled={playingAs && hand.canPlay(card, playingAs)}
          faceUp={isPlayer || isDummy}
          key={card.id}
          card={card}
          onClick={() => play?.(card)}
          sx={{ ml: `-${margin}px` }}
        />
      ))}
    </Box>
  );
}
