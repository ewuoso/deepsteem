import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";

@Component({
  selector: "app-voteinfo",
  templateUrl: "./voteinfo.component.html",
  styleUrls: ["./voteinfo.component.css"]
})
export class VoteInfoComponent implements OnInit {
  public vote_value: number = 0;
  public voting_power: number = 0;
  constructor(private steemService: SteemService) {}

  update() {
    this.steemService
      .accountExists(this.steemService.account_name)
      .then(exists => {
        if (!exists) return;
        this.steemService
          .getVotingPower(this.steemService.account_name)
          .then(vpow => (this.voting_power = vpow));

        this.steemService
          .getVoteValue(this.steemService.account_name)
          .then(val => (this.vote_value = val));
      });
  }

  ngOnInit() {
    this.update();
    this.steemService.account_changed.subscribe(name => {
      this.update();
    });
  }
}
