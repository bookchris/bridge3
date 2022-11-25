import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import useSize from "@react-hook/size";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Hand, HandState, Seat } from "../../../functions/core";
import { BidBox } from "./bidBox";
import { BiddingCard } from "./biddingCard";
import { ContractCard } from "./contractCard";
import { Controls } from "./controls";
import { Holding } from "./holding";
import { Play } from "./playCard";
import { PlayerBox } from "./playerBox";
import { usePosition } from "./position";
import { ScoreBox } from "./scoreBox";
import { Trick } from "./trick";

interface BoardContextType {
  hand: Hand;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
  handAt: Hand;
  width: number;
  scale: number;
}

const BoardContext = createContext({} as BoardContextType);

export const useBoardContext = () => useContext(BoardContext);

export interface BoardProps {
  hand: Hand;
  live?: boolean;
  analysis?: boolean;
  position?: number;
  playingAs?: Seat;
}

export function Board({ hand, live, playingAs }: BoardProps) {
  const { position, setPosition } = usePosition(hand);
  const readOnly = position !== hand.positions || !live || !playingAs;

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  const ref = useRef<HTMLDivElement>(null);
  const [width] = useSize(ref);

  const handAt = hand.atPosition(position);

  const value = useMemo(
    () => ({
      width: width,
      scale: width / 900,
      hand: hand,
      handAt: handAt,
      playingAs: playingAs,
      position: position,
      setPosition: setPosition,
    }),
    [width, hand, handAt, playingAs, position, setPosition]
  );

  const right = (
    <>
      <Controls hand={hand} position={position} setPosition={setPosition} />
      <ContractCard />
      <BiddingCard hand={hand} position={position} />
      {!hand.isBidding && <Play hand={hand} position={position} />}
    </>
  );
  return (
    <div>
      <BoardContext.Provider value={value}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            //my: 2,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {isXl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 400,
              }}
            ></Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Paper
              ref={ref}
              square={!isSm}
              sx={{
                backgroundColor: "#378B05",
                width: {
                  xs: "100vmin",
                  sm: "min(100vmin, 800px);",
                },
                height: "min(85vmin, 680px);",
                position: "relative",
              }}
            >
              <Holding seat={Seat.North} />
              <Holding seat={Seat.West} />
              <Holding seat={Seat.East} />
              <Holding seat={Seat.South} />
              <PlayerBox seat={Seat.South} />
              <PlayerBox seat={Seat.North} />
              <PlayerBox seat={Seat.East} />
              <PlayerBox seat={Seat.West} />
              {!readOnly && handAt.state === HandState.Bidding && (
                <BidBox hand={handAt} seat={playingAs} />
              )}
              {handAt.state === HandState.Playing && <Trick hand={handAt} />}
              {handAt.state === HandState.Complete && (
                <ScoreBox hand={handAt} />
              )}
            </Paper>
            {!isLg && right}
          </Box>
          {isLg && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 300,
              }}
            >
              {right}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: width,
            mt: 2,
          }}
        ></Box>
      </BoardContext.Provider>
    </div>
  );
}

export interface MiniBoardProps {
  hand: Hand;
  onClick?: () => void;
}

export function MiniBoard({ hand, onClick = () => null }: MiniBoardProps) {
  const width = 250;
  const value = useMemo(
    () => ({
      width: width,
      scale: width / 900,
      hand: hand,
      handAt: hand,
      position: hand.positions,
      setPosition: () => null,
    }),
    [width, hand]
  );

  return (
    <Paper
      onClick={onClick}
      sx={{
        backgroundColor: "#378B05",
        width: `${width}px`,
        height: `${width}px`,
        position: "relative",
        cursor: "pointer",
      }}
    >
      <BoardContext.Provider value={value}>
        <Holding seat={Seat.North} />
        <Holding seat={Seat.West} />
        <Holding seat={Seat.East} />
        <Holding seat={Seat.South} />
        <PlayerBox seat={Seat.South} />
        <PlayerBox seat={Seat.North} />
        <PlayerBox seat={Seat.East} />
        <PlayerBox seat={Seat.West} />
        {hand.state === HandState.Playing && <Trick hand={hand} />}
        {hand.state === HandState.Complete && <ScoreBox hand={hand} />}
      </BoardContext.Provider>
    </Paper>
  );
}
