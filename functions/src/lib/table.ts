import { firestore } from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Hand } from "../../core";
import { Table } from "../../storage/table";

export const tableConverter: FirebaseFirestore.FirestoreDataConverter<Table> = {
  toFirestore(table: Table): FirebaseFirestore.DocumentData {
    return {
      ...table.toJson(),
      uids: table.uids,
      created: table.created
        ? Timestamp.fromDate(table.created)
        : firestore.FieldValue.serverTimestamp(),
    };
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Table {
    const data = snapshot.data();
    const hand = Hand.fromJson(data);
    const created: Timestamp = data.created;
    return new Table(hand, {
      id: snapshot.id,
      uids: data.uids,
      created: created.toDate(),
    });
  },
};
