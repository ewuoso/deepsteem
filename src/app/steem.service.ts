import { Injectable, Output, EventEmitter } from "@angular/core";
import {
  RewardFund,
  SteemTools,
  MedianPriceHistory,
  DynamicGlobalProperties
} from "./steem_tools";
import { SteemApi } from "./steem_api";

@Injectable()
export class SteemService {
  @Output() account_changed = new EventEmitter<String>();
  public account_name: String = null;
  cached_reward_fund: RewardFund = null;
  cached_median_price_history: MedianPriceHistory = null;
  cached_dynamic_global_properties: DynamicGlobalProperties = null;
  constructor() {
    let stored_account_name = localStorage.getItem("account_name");
    if (stored_account_name) this.account_name = stored_account_name;
  }

  setAccountName(newName: String) {
    this.account_name = newName;
    this.account_changed.emit(newName);
  }

  getAgeInSeconds(timeStamp): any {
    var now: any = new Date();
    var time: any = new Date(timeStamp + "Z");
    return (now - time) / 1000;
  }

  accountExists(accountName): Promise<boolean> {
    return new Promise((resolve, reject) => {
      SteemApi.api.getAccounts([accountName], (err, response) => {
        if (err) return reject(err);
        if (response[0]) return resolve(true);
        else return resolve(false);
      });
    });
  }

  getVotingPower(accountName): Promise<number> {
    return new Promise((resolve, reject) => {
      SteemApi.api.getAccounts([accountName], (err, response) => {
        if (err) return reject(err);
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
        return resolve(this.cached_reward_fund);
      SteemApi.api.getRewardFund("post", (err, result) => {
        if (err) reject(err);
        this.cached_reward_fund = new RewardFund(result);
        resolve(this.cached_reward_fund);
      });
    });
  }

  getCurrentMedianHistoryPrice(): Promise<MedianPriceHistory> {
    return new Promise((resolve, reject) => {
      if (
        this.cached_median_price_history &&
        this.cached_median_price_history.isCurrent()
      )
        return resolve(this.cached_median_price_history);
      SteemApi.api.getCurrentMedianHistoryPrice((err, response) => {
        if (err) return reject(err);
        this.cached_median_price_history = new MedianPriceHistory(response);
        resolve(this.cached_median_price_history);
      });
    });
  }

  getDynamicGlobalProperties(): Promise<DynamicGlobalProperties> {
    return new Promise((resolve, reject) => {
      if (
        this.cached_dynamic_global_properties &&
        this.cached_dynamic_global_properties.isCurrent()
      )
        return resolve(this.cached_dynamic_global_properties);
      resolve(
        SteemApi.api.getDynamicGlobalProperties().then(dgp => {
          this.cached_dynamic_global_properties = new DynamicGlobalProperties(
            dgp
          );
          return dgp;
        })
      );
    });
  }

  getAccount(accountName): Promise<any> {
    return new Promise((resolve, reject) => {
      SteemApi.api.getAccounts([accountName], (err, response) => {
        if (err) reject(err);
        resolve(response[0]);
      });
    });
  }

  async getVoteValue(accountName): Promise<any> {
    const rewardFund: RewardFund = await this.getRewardFund();
    const single_input = typeof accountName == "string";
    if (single_input) accountName = [accountName];
    const priceHistory = await this.getCurrentMedianHistoryPrice();
    const accounts = await SteemApi.api.getAccounts(accountName);
    const vote_values = accounts.map(account => {
      const vesting_shares: number =
        parseFloat(account.vesting_shares.replace(" VESTS", "")) * 1000000;
      const received_shares: number =
        parseFloat(account.received_vesting_shares.replace(" VESTS", "")) *
        1000000;
      const delegated_shares: number =
        parseFloat(account.delegated_vesting_shares.replace(" VESTS", "")) *
        1000000;
      var vote_share: number =
        0.02 *
        (vesting_shares + received_shares - delegated_shares) /
        rewardFund.recent_claims;
      var vote_steem_value: number = vote_share * rewardFund.reward_balance;
      var steem_value: number = priceHistory.price();
      return steem_value * vote_steem_value;
    });
    if (single_input) return vote_values[0];
    return vote_values;
  }

  async getVotes(accountName, maxAge = 60 * 60 * 24 * 7): Promise<any> {
    return new Promise((resolve, reject) => {
      SteemApi.api.getAccountVotes(accountName, (err, response) => {
        if (err) return reject(err);
        resolve(
          response.filter(vote => {
            const voteAge = this.getAgeInSeconds(vote.time);
            return voteAge < maxAge;
          })
        );
      });
    });
  }

  async getPayout(post): Promise<any> {
    const rewardFund: RewardFund = await this.getRewardFund();
    const priceHistory: MedianPriceHistory = await this.getCurrentMedianHistoryPrice();
    const dgp: DynamicGlobalProperties = await this.getDynamicGlobalProperties();
    const payout = SteemTools.payOut(post, rewardFund, priceHistory, dgp);
    return payout;
  }

  async getCurationReward(vote): Promise<any> {
    const rewardFund: RewardFund = await this.getRewardFund();
    const priceHistory: MedianPriceHistory = await this.getCurrentMedianHistoryPrice();
    return new Promise((resolve, reject) => {
      const author = vote.authorperm.split("/")[0];
      const permlink = vote.authorperm.split("/")[1];
      resolve(
        SteemApi.api.getContent(author, permlink).then(post => {
          if (vote.weight == 0 || post.total_vote_weight == 0) return vote;

          // if the post's total payout is less than 0.020 SBD, there is
          // no payout at all:
          const claim: number = post.net_rshares * post.reward_weight / 10000.0;
          const postReward: number =
            Math.floor(
              claim *
                rewardFund.reward_balance *
                1000.0 /
                rewardFund.recent_claims
            ) / 1000.0;
          if (postReward * priceHistory.price() < 0.02) return vote;

          const share = vote.weight / post.total_vote_weight;
          const totalRShares = post.active_votes
            .map(vote => parseFloat(vote.rshares))
            .reduce((acc, share) => acc + share);
          const curationShares = share * 0.25 * totalRShares;
          const reward =
            Math.floor(
              1000.0 *
                Math.max(
                  0,
                  curationShares *
                    rewardFund.reward_balance /
                    rewardFund.recent_claims
                )
            ) / 1000.0;
          vote.value = reward;
          vote.eta = 60 * 60 * 24 * 7 - this.getAgeInSeconds(post.created);
          return vote;
        })
      );
    });
  }

  async getComments(accountName, commentLimit = 10): Promise<any> {
    return new Promise((resolve, reject) => {
      let date = new Date();
      date.setTime(date.getTime() - 1000.0 * 60.0 * 24 * 7);
      let dateString = date.toJSON().substr(0, 19);
      //steem.api.getDiscussionsByBlog(
      SteemApi.api.getDiscussionsByComments(
        { start_author: accountName, limit: commentLimit },
        (err, response) => {
          if (err) reject(err);
          resolve(response);
        }
      );
    });
  }

  async getPosts(
    accountName,
    limit = 10,
    maxAge = 60 * 60 * 24 * 7
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let date = new Date();
      date.setTime(date.getTime() - 1000.0 * 60.0 * 24 * 7);
      let dateString = date.toJSON().substr(0, 19);
      SteemApi.api.getDiscussionsByAuthorBeforeDate(
        accountName,
        "",
        dateString,
        limit,
        (err, response) => {
          if (err) reject(err);
          let recent = response.filter(post => {
            let post_age = this.getAgeInSeconds(post.created);
            if (post_age < maxAge) return true;
            return false;
          });
          resolve(recent);
        }
      );
    });
  }

  async getRewardHistory(): Promise<any> {
    const dgp = await this.getDynamicGlobalProperties();
    return SteemTools.getCurationRewardHistory(this.account_name, dgp);
  }

  async getFollowers(): Promise<any> {
    return SteemTools.getFollowers(this.account_name);
  }

  async getFollowCount(): Promise<any> {
    return SteemTools.getFollowCount(this.account_name);
  }
}
