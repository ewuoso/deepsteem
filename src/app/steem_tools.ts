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
  public total_vesting_fund_steem: number;
  public total_vesting_shares: number;
  public steem_per_mvest: number;

  constructor(dynamic_global_properties: any) {
    this.sbd_print_rate = dynamic_global_properties.sbd_print_rate;
    this.total_vesting_fund_steem = parseFloat(
      dynamic_global_properties.total_vesting_fund_steem.replace(" STEEM", "")
    );
    this.total_vesting_shares = parseFloat(
      dynamic_global_properties.total_vesting_shares.replace(" STEEM", "")
    );
    this.steem_per_mvest =
      this.total_vesting_fund_steem * 1000000 / this.total_vesting_shares;
    this.time_retrieved = Date.now();
  }

  isCurrent(): boolean {
    const now: any = new Date();
    return (now - this.time_retrieved) / 1000.0 < 5 * 60;
  }
}

export class SteemTools {
  public static getAgeInSeconds(timeStamp): any {
    var now: any = new Date();
    var time: any = new Date(timeStamp + "Z");
    return (now - time) / 1000;
  }

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

  // getFeedHistory
  //
  // Promise wrapper for steem.api.getFeedHistory
  public static getFeedHistory(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getFeedHistory((err, response) => {
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

  // getAccountHistory
  //
  // Promise wrapper for steem.api.getAccountHistory
  public static getAccountHistory(account, start, limit): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getAccountHistory(account, start, limit, (err, response) => {
        if (err) return reject(err);
        return resolve(response);
      });
    });
  }

  public static async getCompleteHistory(
    account,
    maxAge = 60 * 60 * 24 * 7
  ): Promise<any[]> {
    let history: any[] = [];
    history = await this.getAccountHistory(account, -1, 999);
    let totalHistory = history;
    while (1) {
      let firstid = history[0][0];
      if (firstid == 0) {
        break;
      }
      let timestamp = history[0][1].timestamp;
      let age = this.getAgeInSeconds(timestamp);
      if (age > 60 * 60 * 24 * 7) break;
      let limit = Math.min(999, firstid - 1);
      history = await this.getAccountHistory(account, firstid - 1, limit);
      totalHistory = totalHistory.concat(history);
    }
    return totalHistory.filter(
      h => this.getAgeInSeconds(h[1].timestamp) < 60 * 60 * 24 * 7
    );
  }

  public static async getCurationRewardHistory(
    account: String,
    dgp: DynamicGlobalProperties
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCompleteHistory(account).then(history => {
        const curation_transactions = history.filter(
          trx => trx[1].op[0] == "curation_reward"
        );
        let rewards = curation_transactions.map(trx => {
          const op = trx[1].op;
          let r: any = {};
          r.vests = op[1].reward.replace(" VESTS", "");
          r.sp =
            Math.floor(1000.0 * r.vests * dgp.steem_per_mvest / 1000000.0) /
            1000.0;
          r.author = op[1].comment_author;
          r.permlink = op[1].comment_permlink;
          r.timestamp = trx[1].timestamp;
          return r;
        });
        return resolve(rewards);
      });
    });
  }

  public static async getFollowers(account_name: String): Promise<any> {
    let followers: any[] = [];
    followers = await steem.api.getFollowersAsync(
      account_name,
      "",
      "blog",
      100
    );
    while (1) {
      const next_followers: any[] = await steem.api.getFollowersAsync(
        account_name,
        followers[followers.length - 1].follower,
        "blog",
        100
      );
      for (let j = 1; j < next_followers.length; j++) {
        followers.push(next_followers[j]);
      }
      if (next_followers.length < 100) break;
    }
    return followers;
  }
}
