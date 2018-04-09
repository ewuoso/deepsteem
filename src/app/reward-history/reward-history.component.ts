import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-reward-history",
  templateUrl: "./reward-history.component.html",
  styleUrls: ["./reward-history.component.css"]
})
export class RewardHistoryComponent implements OnInit {
  public rewards: any[];

  constructor(
    private steemService: SteemService,
    private sanitizer: DomSanitizer
  ) {}

  update() {
    this.steemService.getRewardHistory().then(newRewards => {
      newRewards.forEach(r => {
        r.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          "https://steemit.com/@" + r.author + "/" + r.permlink
        );
        r.seconds = this.steemService.getAgeInSeconds(r.timestamp);
      });
      this.rewards = newRewards.sort((a, b) => a.seconds - b.seconds);
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
