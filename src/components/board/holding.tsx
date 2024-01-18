import { Box } from "@mui/material";
import { Card, Seat } from "../../../functions/core";
import { Solution } from "../../lib/useDds";
import { useBoardContext } from "./board";
import { PlayingCard } from "./card";
import { useTableContext } from "./table";

export interface HoldingProps {
  seat: Seat;
  nextCard?: Card;
  dds?: Solution;
}

export function Holding({ seat, nextCard, dds }: HoldingProps) {
  const { width, hand, handAt, live } = useBoardContext();
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
          dds={dds?.[card.id]}
          selected={nextCard?.id === card.id}
          enabled={playingAs && hand.canPlay(card, playingAs)}
          faceUp={!live || isPlayer || isDummy}
          key={card.id}
          card={card}
          onClick={() => play?.(card)}
          sx={{ ml: `-${margin}px` }}
        />
      ))}
    </Box>
  );
}
