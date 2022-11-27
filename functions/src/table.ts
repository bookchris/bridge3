import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  CreateTableRequest,
  CreateTableResponse,
  TableBidRequest,
  TableBidResponse,
  TablePlayRequest,
  TablePlayResponse,
} from "../api/table";
import { Bid, Card, Hand, Seats } from "../core";
import { Table } from "../storage/table";
import { db } from "./lib/firebase";
import { triggerRobot } from "./lib/robot";
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

  /*
  const ref = database.ref("tables").push();
  await ref.set(hand.toJson());
  return { id: ref.key || "" };
  */

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

    const ref = db
      .collection("tables")
      .withConverter(tableConverter)
      .doc(tableId);

    const doc = await ref.get();
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

    await ref.update({ bidding: newHand.toJson().bidding });
    await triggerRobot(table.updateHand(newHand));
  }
);

export const tableplay = onCall<TablePlayRequest, Promise<TablePlayResponse>>(
  async ({ data, auth }) => {
    logger.info("tableplay start");
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("invalid-argument", "user is required");

    const { tableId } = data;
    if (!tableId)
      throw new HttpsError("invalid-argument", "tableId is required");

    const { card } = data;
    if (typeof card !== "number")
      throw new HttpsError("invalid-argument", "card is required");

    const ref = db
      .collection("tables")
      .withConverter(tableConverter)
      .doc(tableId);

    const doc = await ref.get();
    const table = doc.data();
    if (!table)
      throw new HttpsError("invalid-argument", `table ${tableId} not found`);

    const playerIndex = table.uids.indexOf(uid);
    if (playerIndex === -1)
      throw new HttpsError(
        "invalid-argument",
        `${uid} is not a player on table ${tableId}`
      );

    const newHand = table.doPlay(new Card(card), Seats[playerIndex]);
    if (!newHand)
      throw new HttpsError(
        "invalid-argument",
        `${card} is not a valid play on ${tableId}`
      );

    await ref.update({ play: newHand.toJson().play });
    logger.info("tableplay end");
    await triggerRobot(table.updateHand(newHand));
  }
);
