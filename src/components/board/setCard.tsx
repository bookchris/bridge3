import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Hand, Seat } from "../../../functions/core";
import { useBoardContext } from "./board";
import { ResultText } from "./resultText";

export interface SetCardProps {
  hand: Hand;
  set: Hand[];
}

export function SetCard({ hand, set }: SetCardProps) {
  //const { push, query, pathname } = useRouter();
  const { setPosition } = useBoardContext();
  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Boards</Typography>
      </Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Contract</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {set.map((h) => (
            <TableRow
              hover
              onClick={() => {
                const newQuery: any = { ...query, hand: h.id };
                delete newQuery["position"];
                push({ pathname: pathname, query: newQuery });
              }}
              key={h.id}
              sx={{
                backgroundColor:
                  h.board === hand.board ? "grey.300" : undefined,
                cursor: "pointer",
              }}
            >
              <TableCell>{h.board}</TableCell>
              <TableCell>{h.contract.toString()}</TableCell>
              <TableCell>
                <ResultText result={h.result} />
              </TableCell>
              <TableCell>{h.scoreAs(Seat.South)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
