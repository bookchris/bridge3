import { Hand, Seat } from "../../../functions/core";
import { PlayingCard } from "./card";

export interface TrickProps {
  hand: Hand;
  seat?: Seat; // When specified, limits when you can.
}

export function Trick({ hand, seat }: TrickProps) {
  const tricks = hand.tricks;
  const trick = tricks.length ? tricks[tricks.length - 1] : undefined;

  const seatSxProps = {
    [Seat.West.toString()]: {
      left: "50%",
      top: "50%",
      transform: "translate(-90%, -45%)",
    },
    [Seat.North.toString()]: {
      top: "50%",
      left: "50%",
      transform: "translate(-53%, -80%)",
    },
    [Seat.East.toString()]: {
      top: "50%",
      left: "50%",
      transform: "translate(-10%, -55%)",
    },
    [Seat.South.toString()]: {
      top: "50%",
      left: "50%",
      transform: "translate(-47%, -20%)",
    },
  };
  return (
    <>
      {trick?.cards.map((card, i) => (
        <PlayingCard
          faceUp
          key={card.id}
          card={card}
          sx={{
            position: "absolute",
            ...seatSxProps[trick.leader.next(i).toString()],
          }}
        />
      ))}
    </>
  );
}
