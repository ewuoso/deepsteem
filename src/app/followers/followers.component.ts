import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { FlashMessagesService } from "angular2-flash-messages";

@Component({
  selector: "app-followers",
  templateUrl: "./followers.component.html",
  styleUrls: ["./followers.component.css"]
})
export class FollowersComponent implements OnInit {
  public followers: any[];
  public visible_followers: any[];
  private chunk_size: number = 20;
  public start_idx: number = 0;
  public vote_sum: number = 0;
  public vote_median: number = 0;
  public processed: any = 0;
  public num_followers: number = 0;
  public num_following: number = 0;
  public total: any = "fetching followers...";

  constructor(
    private flashMessagesService: FlashMessagesService,
    private steemService: SteemService
  ) {}

  updateStatistics() {
    const processed_values = this.followers
      .map(f => f.vote_value)
      .filter(v => v != undefined);

    // sum
    this.vote_sum = processed_values.reduce((acc, v) => (acc += v));

    // median
    this.vote_median = processed_values.sort((a, b) => b - a)[
      Math.floor(processed_values.length / 2)
    ];

    // number of processed
    this.processed = processed_values.length;
  }

  next() {
    if (this.start_idx + this.chunk_size < this.followers.length) {
      this.setVisibleFollowers(
        this.followers,
        this.start_idx + this.chunk_size
      );
    }
  }

  previous() {
    if (this.start_idx > 0) {
      this.setVisibleFollowers(
        this.followers,
        this.start_idx - this.chunk_size
      );
    }
  }

  setVisibleFollowers(all_followers, start_idx) {
    this.start_idx = start_idx;
    this.visible_followers = all_followers.slice(
      start_idx,
      Math.min(all_followers.length, start_idx + this.chunk_size)
    );
  }

  flashError(message) {
    this.flashMessagesService.show(message, {
      cssClass: "alert-danger",
      timeout: 5000
    });
  }

  update() {
    this.followers = [];
    this.setVisibleFollowers([], 0);
    this.total = "fetching followers...";
    this.processed = 0;
    this.vote_sum = 0;
    this.steemService
      .getFollowers()
      .then(new_followers => {
        if (new_followers[0].following != this.steemService.account_name)
          return;
        this.followers = new_followers;
        this.setVisibleFollowers(new_followers, 0);
        this.total = new_followers.length;
        /* get the vote values in chunks to reduce the number of requests */
        for (let i = 0; i < new_followers.length; i += this.chunk_size) {
          let chunk_accounts = new_followers.slice(
            i,
            Math.min(new_followers.length, i + this.chunk_size)
          );
          this.steemService
            .getVoteValue(chunk_accounts.map(f => f.follower))
            .then(values => {
              values.forEach((value, index) => {
                chunk_accounts[index].vote_value = value;
              });
              console.log(values);
              this.updateStatistics();
            });
        }
      })
      .catch(err => this.flashError("Connection Error"));
    this.steemService
      .getFollowCount()
      .then(fc => {
        this.num_followers = fc.follower_count;
        this.num_following = fc.following_count;
      })
      .catch(err => this.flashError("Connection Error"));
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
