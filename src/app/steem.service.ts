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

  getRewardFund(): Promise<any> {
    return new Promise((resolve, reject) => {
      steem.api.getRewardFund("post", (err, result) => {
        if (err) reject(err);
        resolve(result);
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
    const rewardFund = await this.getRewardFund();
    const account = await this.getAccount(accountName);
    const priceHistory = await this.getCurrentMedianHistoryPrice();
    console.log(priceHistory);
    const recent_claims: number = parseFloat(rewardFund.recent_claims);
    const vesting_shares: number =
      parseFloat(account.vesting_shares.replace(" VESTS", "")) * 1000000;
    const reward_balance: number = parseFloat(
      rewardFund.reward_balance.replace(" STEEM", "")
    );
    console.log(recent_claims);
    console.log(account);
    var vote_share: number = 0.02 * vesting_shares / recent_claims;
    console.log(vote_share);
    var vote_steem_value: number = vote_share * reward_balance;
    console.log(vote_steem_value);
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
    const rewardFund = await this.getRewardFund();
    return new Promise((resolve, reject) => {
      const author = vote.authorperm.split("/")[0];
      const permlink = vote.authorperm.split("/")[1];
      steem.api.getContent(author, permlink, (err, post) => {
        if (err) reject(err);
        if (vote.weight == 0 || post.total_vote_weight == 0)
          return resolve(vote);
        const recent_claims: number = parseFloat(rewardFund.recent_claims);
        console.log("recent_claims=" + recent_claims);
        const reward_balance: number = parseFloat(
          rewardFund.reward_balance.replace(" STEEM", "")
        );
        const share = vote.weight / post.total_vote_weight;
        console.log("share=" + share);
        const totalRShares = post.active_votes
          .map(vote => parseFloat(vote.rshares))
          .reduce((acc, share) => acc + share);
        console.log("totalRShares=" + totalRShares);
        const curationShares = share * 0.25 * totalRShares;
        console.log(curationShares);
        const reward = Math.max(
          0,
          curationShares * reward_balance / recent_claims
        );
        vote.value = reward;
        vote.eta = 60 * 60 * 24 * 7 - this.getAgeInSeconds(post.created);
        resolve(vote);
      });
    });
  }
}
