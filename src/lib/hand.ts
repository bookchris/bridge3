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
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { Hand } from "../../functions/core";
import { StoredHand } from "../../functions/storage/hand";
import { firestore } from "./firebase";

const handConverter: FirestoreDataConverter<StoredHand> = {
  toFirestore(hand: StoredHand): DocumentData {
    return hand.toJson();
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): StoredHand {
    const data = snapshot.data(options);
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new StoredHand(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  },
};

export function useHand(handId: string) {
  const ref = handId
    ? doc(firestore, "hands", handId).withConverter(handConverter)
    : null;
  return useDocumentData<StoredHand>(ref);
}

export function useHandList(uid: string) {
  const ref = uid
    ? query(
        collection(firestore, "hands").withConverter(handConverter),
        where("uids", "array-contains", uid)
      )
    : null;
  return useCollectionData<StoredHand>(ref);
}
