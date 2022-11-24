import { firestore } from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Hand } from "../../core";
import { StoredHand } from "../../storage/hand";

export const handConverter: FirebaseFirestore.FirestoreDataConverter<StoredHand> =
  {
    toFirestore(hand: StoredHand): FirebaseFirestore.DocumentData {
      return {
        ...hand.toJson(),
        uids: hand.uids,
        created: hand.created
          ? Timestamp.fromDate(hand.created)
          : firestore.FieldValue.serverTimestamp(),
      };
    },
    fromFirestore(
      snapshot: FirebaseFirestore.QueryDocumentSnapshot
    ): StoredHand {
      const data = snapshot.data();
      const hand = Hand.fromJson(data);
      const created: Timestamp = data.created;
      return new StoredHand(hand, {
        id: snapshot.id,
        uids: data.uids,
        created: created.toDate(),
      });
    },
  };
