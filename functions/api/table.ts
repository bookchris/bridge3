export type CreateTableRequest = {
  mode: string;
};

export type CreateTableResponse = {
  id: string;
};

export type TableBidRequest = {
  tableId: string;
  bid: string;
};

export type TableBidResponse = void;
