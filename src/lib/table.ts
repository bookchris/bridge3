import {
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  where,
} from "firebase/firestore";
import { useCallback } from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import {
  TableBidRequest,
  TableBidResponse,
  TablePlayRequest,
  TablePlayResponse,
} from "../../functions/api/table";
import { Bid, Card, Hand } from "../../functions/core";
import { firestore, functions } from "./firebase";
import useCallable, { HttpsCallableHook } from "./useCallable";
import { useUserContext } from "./user";

const tableConverter: FirestoreDataConverter<Table> = {
  toFirestore(): DocumentData {
    return {};
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Table {
    const data = snapshot.data(options);
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new Table(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  },
};

export function useTable(tableId: string) {
  const ref = tableId
    ? doc(firestore, "tables", tableId).withConverter(tableConverter)
    : null;
  return useDocumentData<Table>(ref);
}

export function useTableList() {
  const ref = collection(firestore, "tables").withConverter(tableConverter);
  return useCollectionData<Table>(ref);
}

export function useMyTableList() {
  const { user } = useUserContext();
  const ref = query(
    collection(firestore, "tables").withConverter(tableConverter),
    where("uids", "array-contains", user?.uid || "")
  );

  return useCollectionData<Table>(ref);
}

export function useBid(tableId: string): HttpsCallableHook<Bid, void> {
  const [internalRun, inProgress, error] = useCallable<
    TableBidRequest,
    TableBidResponse
  >(functions, "tablebid");
  const run = useCallback(
    (bid: Bid) => internalRun({ tableId: tableId, bid: bid.toJson() }),
    [internalRun, tableId]
  );
  return [run, inProgress, error];
}

export function usePlay(tableId: string): HttpsCallableHook<Card, void> {
  const [internalRun, inProgress, error] = useCallable<
    TablePlayRequest,
    TablePlayResponse
  >(functions, "tableplay");
  const run = useCallback(
    (card: Card) => internalRun({ tableId: tableId, card: card.toJson() }),
    [internalRun, tableId]
  );
  return [run, inProgress, error];
}

export class Table extends Hand {
  readonly id: string;
  readonly uids: string[];
  readonly created?: Date;
  constructor(
    hand: Hand,
    props: { id: string; uids: string[]; created?: Date }
  ) {
    super({ ...hand });
    this.id = props.id;
    this.uids = props.uids;
    this.created = props.created;
  }
}
