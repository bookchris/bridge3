import { createContext, useContext, useMemo } from "react";
import { Seat, Seats } from "../../../functions/core";
import { Table } from "../../lib/table";
import { useUserContext } from "../../lib/user";
import { Board } from "./board";

interface TableContextType {
  table?: Table;
  playingAs?: Seat;
}

const TableContext = createContext<TableContextType>({});

export const useTableContext = () => useContext(TableContext);

export function TableContextProvider({ table }: { table: Table }) {
  const { user } = useUserContext();
  const playerIndex = table?.uids.indexOf(user?.uid || "") ?? -1;
  const playingAs = playerIndex === -1 ? undefined : Seats[playerIndex];

  const value = useMemo(
    () => ({
      table: table,
      playingAs: playingAs,
    }),
    [playingAs, table]
  );

  return (
    <TableContext.Provider value={value}>
      <Board hand={table} playingAs={playingAs} live />
    </TableContext.Provider>
  );
}
