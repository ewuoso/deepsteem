import * as steem from "steem";

export class RewardFund {
  time_retrieved: any;
  recent_claims: number;
  reward_balance: number;

  constructor(reward_fund: any) {
    this.recent_claims = parseFloat(reward_fund.recent_claims);
    this.reward_balance = parseFloat(
      reward_fund.reward_balance.replace(" STEEM", "")
    );
    this.time_retrieved = Date.now();
  }

  isCurrent(): boolean {
    const now: any = new Date();
    return (now - this.time_retrieved) / 1000.0 < 5 * 60;
  }
}

export class SteemTools {
  public static getRewardFund(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getRewardFund("post", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  getContent(author: String, permlink: String): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getContent(author, permlink, function(err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  getCurrentMedianHistoryPrice(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getCurrentMedianHistoryPrice((err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  payCurators(post: any, max_reward_tokens: number): number {
    let unclaimed = max_reward_tokens;
    const total_weight = post.total_vote_weight;
    post.active_votes.forEach(vote => {
      unclaimed -= max_reward_tokens * vote.weight / total_weight;
    });

    return Math.max(0, unclaimed);
  }

  payOut(post: any, reward_fund: any, median_price_history: any): number[] {
    const recent_claims = parseFloat(reward_fund.recent_claims);
    const reward_balance = parseFloat(
      reward_fund.reward_balance.replace(" STEEM", "")
    );

    const current_steem_price = median_price_history.base.replace(" SBD", "");
    const claim = post.net_rshares * post.reward_weight / 10000.0;
    const reward = claim * reward_balance / recent_claims;

    // There is a payout threshold of 0.020 SBD.
    if (reward * current_steem_price < 0.02) return [0, 0];

    const curation_tokens =
      reward * reward_fund.percent_curation_rewards / 10000.0;
    let author_tokens = reward - curation_tokens;

    // re-add unclaimed curation tokens to the author tokens
    author_tokens += this.payCurators(post, curation_tokens);

    let total_beneficiary = 0;
    // pay beneficiaries
    post.beneficiaries.forEach(b => {
      total_beneficiary += author_tokens * b.weight / 10000.0;
    });

    author_tokens -= total_beneficiary;

    const sbd_steem =
      author_tokens * post.percent_steem_dollars / (2 * 10000.0);
    const vesting_steem = author_tokens - sbd_steem;

    return [sbd_steem * current_steem_price, vesting_steem];
  }
}
