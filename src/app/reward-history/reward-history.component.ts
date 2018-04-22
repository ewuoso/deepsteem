import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { DomSanitizer } from "@angular/platform-browser";
import { FlashMessagesService } from "angular2-flash-messages";

@Component({
  selector: "app-reward-history",
  templateUrl: "./reward-history.component.html",
  styleUrls: ["./reward-history.component.css"]
})
export class RewardHistoryComponent implements OnInit {
  public rewards: any[];

  constructor(
    private flashMessagesService: FlashMessagesService,
    private steemService: SteemService,
    private sanitizer: DomSanitizer
  ) {}

  flashError(message) {
    this.flashMessagesService.show(message, {
      cssClass: "alert-danger",
      timeout: 5000
    });
  }

  update() {
    this.steemService
      .getRewardHistory()
      .then(newRewards => {
        newRewards.forEach(r => {
          r.url = this.sanitizer.bypassSecurityTrustResourceUrl(
            "https://steemit.com/@" + r.author + "/" + r.permlink
          );
          r.seconds = this.steemService.getAgeInSeconds(r.timestamp);
        });
        this.rewards = newRewards.sort((a, b) => a.seconds - b.seconds);
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
