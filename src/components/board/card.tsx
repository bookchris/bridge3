import { Box, ButtonBase, ButtonBaseProps, styled } from "@mui/material";
import { Card } from "../../../functions/core";
import { useBoardContext } from "./board";
import { cardColor } from "./cardText";

const CardImage = styled("img")({
  display: "block",
});

export const useCardSize = () => {
  const { width } = useBoardContext();
  return {
    width: width / 9.3,
    height: width / 6,
  };
};

export enum Orientation {
  None = 0,
  Left = 1,
  Right = 2,
}

export interface PlayingCardProps extends ButtonBaseProps {
  card: Card;
  orientation?: Orientation;
  enabled?: boolean;
  faceUp?: boolean;
  selected?: boolean;
  dds?: number;
}

export function PlayingCard({
  card,
  enabled,
  selected,
  orientation = Orientation.None,
  faceUp,
  dds,
  onClick,
  ...paperProps
}: PlayingCardProps) {
  const { width, height } = useCardSize();
  const paperSxProps = {
    [Orientation.None]: { width: width, height: height },
    [Orientation.Left]: { width: height, height: width },
    [Orientation.Right]: { width: height, height: width },
  };
  const color = cardColor(card);
  return (
    <ButtonBase
      {...paperProps}
      disabled={!enabled}
      onClick={enabled ? onClick : undefined}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected ? "grey.300" : "white",
        fontSize: width / 6,
        borderRadius: 2,
        boxShadow: 1,
        ...paperSxProps[orientation],
        ...paperProps?.sx,
        cursor: enabled ? "pointer" : undefined,
      }}
    >
      {faceUp ? (
        <>
          <Box sx={{ position: "absolute", top: "0.5em", left: "0.9em" }}>
            <CornerText sx={{ color: color }}>{card.rankStr}</CornerText>
            <CornerText sx={{ color: color }}>
              {card.suit.toString()}
            </CornerText>
            {dds !== undefined && <DdsText>{dds}</DdsText>}
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "0.5em",
              right: "0.9em",
              transform: "rotate(180deg);",
            }}
          >
            <CornerText sx={{ color: color }}>{card.rankStr}</CornerText>
            <CornerText sx={{ color: color }}>
              {card.suit.toString()}
            </CornerText>
          </Box>
        </>
      ) : (
        <CardImage
          width={width}
          height={height}
          src="https://upload.wikimedia.org/wikipedia/commons/6/67/Cards-Reverse.svg"
        />
      )}
    </ButtonBase>
  );
}

const CornerText = styled("div")({
  fontSize: "2.0em",
  fontFamily: "'Roboto Slab', serif;",
  lineHeight: 0.8,
  width: "1em",
  textAlign: "center",
  transform: "translate(-50%, 0);",
});

const DdsText = styled("div")({
  width: "1em",
  marginTop: "8px",
  textAlign: "center",
  transform: "translate(-50%, 0);",
});
