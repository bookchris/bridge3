import axios from "axios";
import { firestore, logger } from "firebase-functions";
import { Bid, Card, Hand, Seat, Suit } from "../core";
import { db } from "./lib/firebase";
import { tableConverter } from "./lib/table";

const baseURL = process.env.BEN_URL;

export const robot = firestore
  .document("tables/{tableId}")
  .onWrite(async (_, context) => {
    const tableId = context.params.tableId;
    logger.info("onWrite for table " + tableId);

    const ref = db
      .collection("tables")
      .withConverter(tableConverter)
      .doc(tableId);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      throw new Error("Table not found at " + tableId);
    }

    const table = snapshot.data();
    if (!table) throw new Error(`table ${tableId} not found`);

    const turn = table.turn;
    if (!turn) {
      logger.info("Nobody's turn");
      return;
    }

    const turnOrDelcarer = table.isDummy(turn) ? turn.partner() : turn;
    if (table.uids.at(turnOrDelcarer.index()) !== "Robot") {
      logger.info("Not Robot's turn");
      return;
    }

    logger.info("Robot's turn!");
    let newHand: Hand | undefined;
    if (table.isBidding) {
      const bid = await getBid(table);
      newHand = table.doBid(bid, turn);
      if (!newHand) {
        logger.info("unable to perform bid", bid.toString());
      }
    } else if (table.isPlaying) {
      if (!table.play.length) {
        const card = await getLead(table);
        newHand = table.doPlay(card, turn);
        if (!newHand) {
          logger.info("unable to perform lead", card.toString());
        }
      } else {
        const playable = table
          .getHolding(turn)
          .filter((card) => table.canPlay(card, turn));
        let card: Card;
        if (playable.length === 1) {
          card = playable[0];
        } else {
          card = await getPlay(table);
        }
        newHand = table.doPlay(card, turn);
        if (!newHand) {
          logger.info("unable to perform play", card.toString());
        }
      }
    }
    if (newHand) {
      const newTable = table.updateHand(newHand);
      await ref.set(newTable);
      console.log("table updated with Robot moved");
    }
  });

const getBid = async (hand: Hand) => {
  const req = {
    vul: hand.vulnerability.toBen(),
    hand: getHolding(hand),
    auction: getAuction(hand),
  };
  console.log("requesting bid", req);
  const resp = await axios.post(baseURL + "/api/bid", req);
  const data: { bid: string } = resp.data;
  console.log("response", data);
  return new Bid(data.bid);
};

const getLead = async (hand: Hand) => {
  const req = {
    vul: hand.vulnerability.toBen(),
    hand: getHolding(hand),
    auction: getAuction(hand),
  };
  console.log("requesting lead", req);
  const resp = await axios.post(baseURL + "/api/lead", req);
  const data: { card: string } = resp.data;
  console.log("response", data);
  return Card.fromLin(data.card);
};

const getPlay = async (hand: Hand) => {
  const req = {
    vul: hand.vulnerability.toBen(),
    hands: [
      holdingToBen(hand.getDeal(Seat.North)),
      holdingToBen(hand.getDeal(Seat.East)),
      holdingToBen(hand.getDeal(Seat.South)),
      holdingToBen(hand.getDeal(Seat.West)),
    ],
    auction: getAuction(hand),
    play: hand.play.map((c) => c.toBen()),
  };
  console.log("requesting play", req);
  const resp = await axios.post(baseURL + "/api/play", req);
  const data: { card: string } = resp.data;
  console.log("response", data);
  return Card.fromLin(data.card);
};

const getAuction = (hand: Hand) => {
  const padding = [] as string[];
  for (let d = hand.dealer; d !== Seat.North; d = d.next()) {
    padding.push("PAD_START");
  }
  return [...padding, ...hand.bidding.map((b) => b.toBen())];
};

const getHolding = (hand: Hand, seat?: Seat) => {
  if (!seat) {
    seat = hand.turn;
  }
  return holdingToBen(hand.getHolding(seat!));
};

const holdingToBen = (cards: Card[]) => {
  const holdingMap = cards.reduce(
    (m, card) => {
      const suit = card.suit.toString();
      m[suit] += card.rankStr;
      return m;
    },
    {
      [Suit.Spade.toString()]: "",
      [Suit.Heart.toString()]: "",
      [Suit.Diamond.toString()]: "",
      [Suit.Club.toString()]: "",
    }
  );
  return Object.values(holdingMap).join(".");
};
