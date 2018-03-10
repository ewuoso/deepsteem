import { Component } from "@angular/core";
import * as steem from "steem";
import { SteemService } from "./steem.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  voting_power: any = 0.0;
  vote_value: any = 0.0;
  votes: any[] = [];
  curation_sum: any = 0.0;
  curation_sum_1d: any = 0.0;
  account_name: String = "nafestw";

  constructor(
    private steemService: SteemService,
    private sanitizer: DomSanitizer
  ) {}

  updateCurationSum() {
    this.curation_sum = this.votes
      .map(vote => vote.value)
      .reduce((acc, value) => acc + value);
    this.curation_sum_1d = this.votes
      .filter(vote => vote.eta < 24 * 60 * 60)
      .map(vote => vote.value)
      .reduce((acc, value) => acc + value);
  }

  accountChanged(newName) {
    this.curation_sum = 0.0;
    this.curation_sum_1d = 0.0;
    this.account_name = newName;
    this.update();
    return newName;
  }

  update() {
    this.steemService
      .getVotingPower(this.account_name)
      .then(vpow => (this.voting_power = vpow));

    this.steemService
      .getVoteValue(this.account_name)
      .then(val => (this.vote_value = val));

    this.steemService.getVotes(this.account_name).then(val => {
      val.forEach(vote => {
        vote.value = 0.0;
        vote.eta = 0;
      });
      val.forEach(
        vote =>
          (vote.url = this.sanitizer.bypassSecurityTrustResourceUrl(
            "https://steemit.com/@" + vote.authorperm
          ))
      );
      this.votes = val;
      for (let i: number = 0; i < this.votes.length; i++) {
        let vote = this.votes[i];
        this.steemService.getCurationReward(vote).then(vote => {
          if (vote.value < 0.0005) {
            let index = this.votes.indexOf(vote);
            if (index > -1) this.votes.splice(index, 1);
          }
          this.updateCurationSum();
        });
      }
    });
  }

  ngOnInit() {
    this.update();
  }
}
