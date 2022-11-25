import { HttpsError, onCall } from "firebase-functions/v2/https";
import { ImportHandRequest, ImportHandResponse } from "../api/import";
import { Hand } from "../core";
import { StoredHand } from "../storage/hand";
import { db } from "./lib/firebase";
import { handConverter } from "./lib/hand";

export const importhand = onCall<
  ImportHandRequest,
  Promise<ImportHandResponse>
>(async ({ data, auth }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("invalid-argument", "user is required");

  const { input } = data;
  if (!input) throw new HttpsError("invalid-argument", "input is required");

  let hand: Hand;
  try {
    hand = Hand.fromLin(input);
  } catch (err: unknown) {
    throw new HttpsError("invalid-argument", errorToString(err));
  }
  const ref = db.collection("hands").withConverter(handConverter).doc();
  await ref.set(new StoredHand(hand, { id: ref.id, uids: [uid] }));
  return { id: ref.id };
});

function errorToString(err: unknown) {
  return err instanceof Error ? err.message : "unknown error";
}
