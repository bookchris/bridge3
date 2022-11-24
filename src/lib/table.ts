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
import { Bid, Hand, Seat } from "../../functions/core";
import { firestore } from "./firebase";
import { useUserContext } from "./user";

const tableConverter: FirestoreDataConverter<Table> = {
  toFirestore(table: Table): DocumentData {
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

export function useBid(tableId?: string) {
  const { user } = useUserContext();
  const userId = user?.uid;
  /*
  const { run } = useBid(`/api/table/${tableId}:bid`, {
    bid: bid,
      body: JSON.stringify({ input: input }),
    })
      .then(async (resp: Response) => {
        if (resp.status !== 200) {
          const err = await resp.json();
          throw new Error(err.err || "unknown server error");
        }
        const { id }: { id: string } = await resp.json();
        router.push("/hands/" + id);
      })
      .catch(setError);

  }, []);
  */
  return useCallback((bid: Bid, seat: Seat) => {}, []);
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
