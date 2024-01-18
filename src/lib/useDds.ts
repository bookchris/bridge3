import { useMemo } from "react";
import { Card, Hand } from "../../functions/core";
import { holdingsToPbnDeal } from "../../functions/core/pbn";

declare const nextPlays: (
  board: string,
  trump: string,
  plays: string[]
) => {
  plays: {
    suit: string;
    rank: string;
    score: number;
    equals: string[];
  }[];
};

export interface Solution {
  [id: number]: number;
}

export function useDds(hand: Hand): Solution | undefined {
  return useMemo(() => {
    let leader = hand.openingLeader;
    if (!leader) return undefined;

    const player = hand.player;
    if (!player) return undefined;

    const trump = hand.contract.suitBid?.suit?.toPbn();
    if (!trump) return undefined;

    const tricks = hand.tricks;
    const lastTrick = tricks.at(-1);
    const played: string[] = [];
    if (lastTrick) {
      if (!lastTrick.complete) {
        leader = lastTrick.leader;
        for (const card of lastTrick.cards) {
          played.push(card.toPbn());
        }
      } else {
        leader = lastTrick.winningSeat;
      }
    }
    const lastTrickHand = hand.atPosition(hand.positions - played.length);
    const pbn = holdingsToPbnDeal(lastTrickHand, leader);
    const o = nextPlays(pbn, trump, played);
    const newSolution: Solution = {};
    for (const play of o.plays) {
      newSolution[Card.parse(play.suit + play.rank).id] = play.score;
      for (const eq of play.equals) {
        newSolution[Card.parse(play.suit + eq).id] = play.score;
      }
    }
    return newSolution;
  }, [hand]);
}
0;
