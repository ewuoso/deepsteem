import { Component } from "@angular/core";
import * as steem from "steem";
import { SteemService } from "./steem.service";
import { DomSanitizer } from "@angular/platform-browser";
import { SteemTools } from "./steem_tools";

class AccountInfo {
  name: String;
  voting_power: number;
  vote_value: number;
  votes: any[];
  vote_num: number;
  vote_processed_num: number;
  curation_sum: number;
  curation_sum_1d: number;
  posts: any[];

  constructor(account_name: String) {
    this.name = account_name;
    this.voting_power = 0.0;
    this.vote_value = 0.0;
    this.vote_num = 0;
    this.vote_processed_num = 0;
    this.votes = [];
    this.curation_sum = 0.0;
    this.curation_sum_1d = 0.0;
    this.posts = [];
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  account_info: AccountInfo = null;
  account_name: String = "nafestw";

  public doughnutChartLabels: string[] = ["self", "others"];
  public doughnutChartData: number[] = [40, 50];
  public doughnutChartType: string = "doughnut";

  constructor(
    private steemService: SteemService,
    private sanitizer: DomSanitizer
  ) {}

  voteHistogram(votes) {
    let upvotes = votes.filter(vote => vote.percent >= 0);
    let authors = upvotes.map(vote => vote.authorperm.split("/")[0]);
    let self_votes = authors.filter(author => author == this.account_name)
      .length;
    let other_votes = upvotes.length - self_votes;
    this.doughnutChartData = [self_votes, other_votes];
  }

  updateCurationSum(account_info: AccountInfo) {
    account_info.curation_sum = 0;
    if (account_info.votes && account_info.votes.length > 0)
      account_info.curation_sum = account_info.votes
        .map(vote => vote.value)
        .reduce((acc, value) => acc + value);

    if (account_info.votes && account_info.votes.length > 0) {
      const votes_24h: any[] = account_info.votes.filter(
        vote => vote.eta < 24 * 60 * 60
      );
      if (votes_24h && votes_24h.length > 0)
        account_info.curation_sum_1d = votes_24h
          .map(vote => vote.value)
          .reduce((acc, value) => acc + value);
    }
  }

  accountChanged(newName) {
    newName = newName.toLowerCase();
    this.account_name = newName;
    localStorage.setItem("account_name", newName);
    this.update();
    return newName;
  }

  update() {
    // create a new AccountInfo object and use a reference to it,
    // don't use this.account_info to avoid that older callbacks (incorrectly)
    // change the state after the account has changed
    let account_info = new AccountInfo(this.account_name);
    this.account_info = account_info;
    this.steemService.accountExists(account_info.name).then(exists => {
      if (!exists) return;
      this.steemService
        .getVotingPower(account_info.name)
        .then(vpow => (account_info.voting_power = vpow));

      this.steemService
        .getVoteValue(account_info.name)
        .then(val => (account_info.vote_value = val));

      this.steemService.getPosts(account_info.name).then(posts => {
        posts.forEach(post => {
          post.steem_value = 0.0;
          post.sbd_value = 0.0;
          post.sp_value = 0.0;
          post.eta =
            60 * 60 * 24 * 7 - this.steemService.getAgeInSeconds(post.created);
          post.shortperm = post.permlink;
          if (post.shortperm.length > 37)
            post.shortperm = post.shortperm.substring(0, 37) + "...";
          post.url = this.sanitizer.bypassSecurityTrustResourceUrl(
            "https://steemit.com/@" + post.author + "/" + post.permlink
          );
        });
        account_info.posts = posts.sort((a, b) => a.eta - b.eta);
        for (let i: number = 0; i < account_info.posts.length; i++) {
          let post = account_info.posts[i];
          this.steemService.getPayout(post).then(payout => {
            post.steem_value = payout[0];
            post.sbd_value = payout[1];
            post.sp_value = payout[2];
          });
        }
      });

      this.steemService.getVotes(account_info.name).then(val => {
        val.forEach(vote => {
          vote.value = 0.0;
          vote.eta = 0;
          vote.shortperm = vote.authorperm;
          if (vote.shortperm.length > 37)
            vote.shortperm = vote.shortperm.substring(0, 37) + "...";
        });
        account_info.vote_num = val.length;
        account_info.vote_processed_num = 0;
        val.forEach(
          vote =>
            (vote.url = this.sanitizer.bypassSecurityTrustResourceUrl(
              "https://steemit.com/@" + vote.authorperm
            ))
        );
        account_info.votes = val;
        this.voteHistogram(account_info.votes);
        for (let i: number = 0; i < account_info.votes.length; i++) {
          let vote = account_info.votes[i];
          this.steemService.getCurationReward(vote).then(vote => {
            if (vote.value < 0.0005) {
              let index = account_info.votes.indexOf(vote);
              if (index > -1) account_info.votes.splice(index, 1);
              account_info.vote_num--;
            } else {
              account_info.vote_processed_num++;
            }
            this.updateCurationSum(account_info);
          });
        }
      });
    });
  }

  ngOnInit() {
    let stored_account_name = localStorage.getItem("account_name");
    if (stored_account_name) this.account_name = stored_account_name;
    this.update();
  }
}
