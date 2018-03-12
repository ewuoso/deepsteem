import { Injectable } from "@angular/core";
import * as steem from "steem";

class RewardFund {
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

@Injectable()
export class SteemService {
  cached_reward_fund: RewardFund = null;
  constructor() {}

  getAgeInSeconds(timeStamp): any {
    var now: any = new Date();
    var time: any = new Date(timeStamp + "Z");
    return (now - time) / 1000;
  }

  accountExists(accountName): Promise<boolean> {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([accountName], (err, response) => {
        if (err) reject(err);
        if (response[0]) resolve(true);
        else resolve(false);
      });
    });
  }

  getVotingPower(accountName): Promise<number> {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([accountName], (err, response) => {
        if (err) reject(err);
        const secondsago = this.getAgeInSeconds(response[0].last_vote_time);
        var vpow = response[0].voting_power + 10000 * secondsago / 432000;
        vpow = Math.min(vpow / 100, 100).toFixed(2);
        resolve(vpow);
      });
    });
  }

  getRewardFund(): Promise<RewardFund> {
    return new Promise((resolve, reject) => {
      // if their is a recent cached reward fund, use it, because it
      // doesn't change that fast
      if (this.cached_reward_fund && this.cached_reward_fund.isCurrent())
        resolve(this.cached_reward_fund);
      steem.api.getRewardFund("post", (err, result) => {
        if (err) reject(err);
        this.cached_reward_fund = new RewardFund(result);
        resolve(this.cached_reward_fund);
      });
    });
  }

  getAccount(accountName): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([accountName], (err, response) => {
        if (err) reject(err);
        resolve(response[0]);
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

  async getVoteValue(accountName): Promise<number> {
    const rewardFund: RewardFund = await this.getRewardFund();
    const account = await this.getAccount(accountName);
    const priceHistory = await this.getCurrentMedianHistoryPrice();
    const vesting_shares: number =
      parseFloat(account.vesting_shares.replace(" VESTS", "")) * 1000000;
    var vote_share: number = 0.02 * vesting_shares / rewardFund.recent_claims;
    var vote_steem_value: number = vote_share * rewardFund.reward_balance;
    var steem_value: number = parseFloat(priceHistory.base.replace(" SBD", ""));
    return steem_value * vote_steem_value;
  }

  async getVotes(accountName, maxAge = 60 * 60 * 24 * 7): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getAccountVotes(accountName, (err, response) => {
        if (err) reject(err);
        resolve(
          response.filter(vote => {
            const voteAge = this.getAgeInSeconds(vote.time);
            return voteAge < maxAge;
          })
        );
      });
    });
  }

  async getCurationReward(vote): Promise<any> {
    const rewardFund: RewardFund = await this.getRewardFund();
    return new Promise((resolve, reject) => {
      const author = vote.authorperm.split("/")[0];
      const permlink = vote.authorperm.split("/")[1];
      steem.api.getContent(author, permlink, (err, post) => {
        if (err) reject(err);
        if (vote.weight == 0 || post.total_vote_weight == 0)
          return resolve(vote);
        const share = vote.weight / post.total_vote_weight;
        const totalRShares = post.active_votes
          .map(vote => parseFloat(vote.rshares))
          .reduce((acc, share) => acc + share);
        const curationShares = share * 0.25 * totalRShares;
        const reward = Math.max(
          0,
          curationShares * rewardFund.reward_balance / rewardFund.recent_claims
        );
        vote.value = reward;
        vote.eta = 60 * 60 * 24 * 7 - this.getAgeInSeconds(post.created);
        resolve(vote);
      });
    });
  }

  async getPosts(accountName, maxAge = 60 * 60 * 24 * 7): Promise<any> {
    return new Promise((resolve, reject) => {
      let date = new Date();
      date.setTime(date.getTime() - 1000.0 * 60.0 * 24 * 7);
      let dateString = date.toJSON().substr(0, 19);
      //steem.api.getDiscussionsByBlog(
      steem.api.getDiscussionsByComments(
        { start_author: accountName, limit: 10 },
        (err, response) => {
          if (err) reject(err);
          resolve(response);
        }
      );
      /*steem.api.getDiscussionsByAuthorBeforeDate(
        accountName,
        "",
        dateString,
        100,
        (err, response) => {
          if (err) reject(err);
          resolve(response);
        }
      );*/
    });
  }
}
