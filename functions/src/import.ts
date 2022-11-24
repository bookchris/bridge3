import * as functions from "firebase-functions";
import { ImportHandRequest, ImportHandResponse } from "../api/importHand";
import { Hand } from "../core";
import { StoredHand } from "../storage/hand";
import { db } from "./lib/firebase";
import { handConverter } from "./lib/hand";

export const importHand = functions.https.onCall(
  async ({ input }: ImportHandRequest, context) => {
    if (!input)
      throw new functions.https.HttpsError(
        "invalid-argument",
        "input is required"
      );
    const uid = context.auth?.uid;
    if (!uid)
      throw new functions.https.HttpsError(
        "invalid-argument",
        "user is required"
      );

    let hand: Hand;
    try {
      hand = Hand.fromLin(input);
    } catch (err: unknown) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        errorToString(err)
      );
    }
    const ref = db.collection("hands").withConverter(handConverter).doc();
    await ref.set(new StoredHand(hand, { id: ref.id, uids: [uid] }));
    const resp: ImportHandResponse = { id: ref.id };
    return resp;
  }
);

function errorToString(err: unknown) {
  return err instanceof Error ? err.message : "unknown error";
}
