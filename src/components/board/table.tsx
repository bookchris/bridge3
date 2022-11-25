import { createContext, useContext, useMemo } from "react";
import { Bid, Seat, Seats } from "../../../functions/core";
import { Table, useBid } from "../../lib/table";
import { useUserContext } from "../../lib/user";
import { Board } from "./board";

interface TableContextType {
  table?: Table;
  playingAs?: Seat;
  bid?: (bid: Bid) => Promise<void>;
}

const TableContext = createContext<TableContextType>({});

export const useTableContext = () => useContext(TableContext);

export function TableContextProvider({ table }: { table: Table }) {
  const { user } = useUserContext();
  const playerIndex = table?.uids.indexOf(user?.uid || "") ?? -1;
  const playingAs = playerIndex === -1 ? undefined : Seats[playerIndex];
  const [bid, inProgress, error] = useBid(table.id);

  const value = useMemo(
    () => ({
      table: table,
      playingAs: playingAs,
      bid: bid,
    }),
    [bid, playingAs, table]
  );

  return (
    <TableContext.Provider value={value}>
      <Board hand={table} playingAs={playingAs} live />
    </TableContext.Provider>
  );
}
