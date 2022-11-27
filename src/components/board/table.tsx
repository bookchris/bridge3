import { createContext, useContext, useMemo } from "react";
import { Bid, Card, Seat, Seats } from "../../../functions/core";
import { Table, useBid, usePlay } from "../../lib/table";
import { useUserContext } from "../../lib/user";
import { Board } from "./board";

interface TableContextType {
  table?: Table;
  playingAs?: Seat;
  bid?: (bid: Bid) => Promise<void>;
  play?: (card: Card) => Promise<void>;
}

const TableContext = createContext<TableContextType>({});

export const useTableContext = () => useContext(TableContext);

export function TableContextProvider({ table }: { table: Table }) {
  const { user } = useUserContext();
  const playerIndex = table?.uids.indexOf(user?.uid || "") ?? -1;
  const playingAs = playerIndex === -1 ? undefined : Seats[playerIndex];
  const [bid, bidInProgress, bidError] = useBid(table.id);
  const [play, playInProgress, playError] = usePlay(table.id);

  const value: TableContextType = useMemo(
    () => ({
      table: table,
      playingAs: playingAs,
      bid: bid,
      play: play,
    }),
    [bid, play, playingAs, table]
  );

  return (
    <TableContext.Provider value={value}>
      <Board hand={table} playingAs={playingAs} live />
    </TableContext.Provider>
  );
}
