import * as steem from "steem";

export class RewardFund {
  time_retrieved: any;
  public recent_claims: number;
  public reward_balance: number;
  public percent_curation_rewards: number;

  constructor(reward_fund: any) {
    this.recent_claims = parseFloat(reward_fund.recent_claims);
    this.reward_balance = parseFloat(
      reward_fund.reward_balance.replace(" STEEM", "")
    );
    this.time_retrieved = Date.now();
    this.percent_curation_rewards = reward_fund.percent_curation_rewards;
  }

  isCurrent(): boolean {
    const now: any = new Date();
    return (now - this.time_retrieved) / 1000.0 < 5 * 60;
  }
}

export class MedianPriceHistory {
  time_retrieved: any;
  public base: number;

  constructor(median_price_history: any) {
    this.base = parseFloat(median_price_history.base.replace(" SBD", ""));
    this.time_retrieved = Date.now();
  }

  isCurrent(): boolean {
    const now: any = new Date();
    return (now - this.time_retrieved) / 1000.0 < 5 * 60;
  }
}

export class DynamicGlobalProperties {
  time_retrieved: any;
  public sbd_print_rate: number;

  constructor(dynamic_global_properties: any) {
    this.sbd_print_rate = dynamic_global_properties.sbd_print_rate;
    this.time_retrieved = Date.now();
  }

  isCurrent(): boolean {
    const now: any = new Date();
    return (now - this.time_retrieved) / 1000.0 < 5 * 60;
  }
}

export class SteemTools {
  // getRewardFund
  //
  // Promise wrapper for steem.api.getRewardFund
  public static getRewardFund(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getRewardFund("post", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  // getCurrentMedianHistoryPrice
  //
  // Promise wrapper for steem.api.getCurrentMedianHistoryPrice
  public static getCurrentMedianHistoryPrice(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getCurrentMedianHistoryPrice((err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  // payCurators - pay all curators and return whats left
  //
  // Distribute max_rewards_tokens among all votes according to
  // their weight. Return the number of undistibuted tokens.
  private static payCurators(post: any, max_reward_tokens: number): number {
    let unclaimed = max_reward_tokens;
    const total_weight = post.total_vote_weight;
    post.active_votes.forEach(vote => {
      unclaimed -=
        Math.floor(1000.0 * max_reward_tokens * vote.weight / total_weight) /
        1000.0;
    });

    return Math.max(0, unclaimed);
  }

  // payOut - return the author rewards for a post.
  //
  // returns an array containing the rewards splitted in
  // SBD and SP
  public static payOut(
    post: any,
    reward_fund: RewardFund,
    median_price_history: MedianPriceHistory,
    dynamic_global_properties: DynamicGlobalProperties
  ): number[] {
    const current_steem_price: number = median_price_history.base;
    const claim: number = post.net_rshares * post.reward_weight / 10000.0;
    const reward: number =
      Math.floor(
        claim * reward_fund.reward_balance * 1000.0 / reward_fund.recent_claims
      ) / 1000.0;

    // There is a payout threshold of 0.020 SBD.
    if (reward * current_steem_price < 0.02) return [0, 0, 0];

    // The share dedicated to curation tokens, is a parameter
    // of the reward fund. Currently it is 25%
    const curation_tokens: number =
      Math.floor(
        1000.0 * reward * reward_fund.percent_curation_rewards / 10000.0
      ) / 1000.0;
    let author_tokens: number = reward - curation_tokens;

    // re-add unclaimed curation tokens to the author tokens
    // unclaimed tokens steem from votes in the first 30 minutes
    // after post creation
    author_tokens += this.payCurators(post, curation_tokens);

    let total_beneficiary: number = 0;
    // pay beneficiaries
    post.beneficiaries.forEach(b => {
      total_beneficiary +=
        Math.floor(1000.0 * author_tokens * b.weight / 10000.0) / 1000.0;
    });

    author_tokens -= total_beneficiary;

    // split the author reward into SBD and SP as requested
    // in the post parameters. Oddly, a value of 10000
    // corresponds to 50% in this case (taken from the steem
    // source code)
    const sbd_steem: number =
      author_tokens * post.percent_steem_dollars / (2 * 10000.0);
    const to_steem =
      Math.floor(
        1000.0 *
          sbd_steem *
          (10000 - dynamic_global_properties.sbd_print_rate) /
          10000.0
      ) / 1000.0;
    const to_sbd = sbd_steem - to_steem;
    const vesting_steem: number = author_tokens - sbd_steem;

    return [to_steem, to_sbd * current_steem_price, vesting_steem];
  }
}
