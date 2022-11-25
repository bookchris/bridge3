import { Transaction } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  CreateTableRequest,
  CreateTableResponse,
  TableBidRequest,
  TableBidResponse,
} from "../api/table";
import { Bid, Hand, Seats } from "../core";
import { Table } from "../storage/table";
import { db } from "./lib/firebase";
import { tableConverter } from "./lib/table";

export const createtable = onCall<
  CreateTableRequest,
  Promise<CreateTableResponse>
>(async ({ data, auth }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("invalid-argument", "user is required");

  const mode = data.mode;
  if (mode !== "solitaire")
    throw new HttpsError("invalid-argument", `invalid mode ${mode}`);

  const hand = Hand.fromDeal();

  const ref = db.collection("tables").withConverter(tableConverter).doc();
  await ref.set(
    new Table(hand, {
      id: ref.id,
      uids: [uid, "Robot", "Robot", "Robot"],
    })
  );
  return { id: ref.id };
});

export const tablebid = onCall<TableBidRequest, Promise<TableBidResponse>>(
  async ({ data, auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("invalid-argument", "user is required");

    const { tableId } = data;
    if (!tableId)
      throw new HttpsError("invalid-argument", "tableId is required");

    const { bid } = data;
    if (!bid) throw new HttpsError("invalid-argument", "bid is required");

    await db.runTransaction(async (txn: Transaction) => {
      const ref = db
        .collection("tables")
        .withConverter(tableConverter)
        .doc(tableId);

      const doc = await txn.get(ref);
      const table = doc.data();
      if (!table)
        throw new HttpsError("invalid-argument", `table ${tableId} not found`);

      const playerIndex = table.uids.indexOf(uid);
      if (playerIndex === -1)
        throw new HttpsError(
          "invalid-argument",
          `${uid} is not a player on table ${tableId}`
        );

      const newHand = table.doBid(new Bid(bid), Seats[playerIndex]);
      if (!newHand)
        throw new HttpsError(
          "invalid-argument",
          `${bid} is not a valid bid on ${tableId}`
        );

      const newTable = table.updateHand(newHand);
      txn.set(ref, newTable);
      return newTable;
    });
    return;
  }
);
