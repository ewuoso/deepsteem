import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";

@Component({
  selector: "app-followers",
  templateUrl: "./followers.component.html",
  styleUrls: ["./followers.component.css"]
})
export class FollowersComponent implements OnInit {
  public followers: any[];
  public vote_sum: number = 0;
  public processed: any = 0;
  public total: any = "fetching followers...";
  constructor(private steemService: SteemService) {}

  updateSum() {
    this.vote_sum = this.followers
      .map(f => f.vote_value)
      .reduce((acc, v) => (acc += v));
    this.processed = this.followers
      .map(f => f.vote_value)
      .filter(v => v > 0).length;
  }

  update() {
    this.followers = [];
    this.total = "fetching followers...";
    this.processed = 0;
    this.vote_sum = 0;
    this.steemService.getFollowers().then(new_followers => {
      if (new_followers[0].following != this.steemService.account_name) return;
      this.followers = new_followers;
      this.total = new_followers.length;
      new_followers.forEach(f => {
        f.vote_value = 0;
        this.steemService.getVoteValue(f.follower).then(value => {
          f.vote_value = value;
          this.updateSum();
        });
      });
    });
  }
  ngOnInit() {
    this.steemService.account_changed.subscribe(name => {
      this.steemService.accountExists(name).then(exists => {
        if (!exists) return;
        this.update();
      });
    });
    this.update();
  }
}
