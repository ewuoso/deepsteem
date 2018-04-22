import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { CoinmarketcapService } from "../coinmarketcap.service";
import { FlashMessagesService } from "angular2-flash-messages";

@Component({
  selector: "app-steem-stats",
  templateUrl: "./steem-stats.component.html",
  styleUrls: ["./steem-stats.component.css"]
})
export class SteemStatsComponent implements OnInit {
  public sbd_print_rate: number = 0;
  public median_price: number = 0;
  public steem_price: number = 0;
  public sbd_price: number = 0;

  constructor(
    private flashMessagesService: FlashMessagesService,
    private steemService: SteemService,
    private cmcService: CoinmarketcapService
  ) {}

  flashError(message) {
    this.flashMessagesService.show(message, {
      cssClass: "alert-danger",
      timeout: 5000
    });
  }

  ngOnInit() {
    this.steemService
      .getCurrentMedianHistoryPrice()
      .then(mhp => (this.median_price = mhp.price()))
      .catch(err => this.flashError("Connection Error"));

    this.steemService
      .getDynamicGlobalProperties()
      .then(dgp => (this.sbd_print_rate = dgp.sbd_print_rate / 100.0))
      .catch(err => this.flashError("Connection Error"));

    this.cmcService
      .getSteemPrice()
      .then(price => (this.steem_price = price))
      .catch(err => {
        this.flashError(
          "Error occured: could not receive current STEEM price from CoinMarketCap"
        );
      });

    this.cmcService
      .getSBDPrice()
      .then(price => (this.sbd_price = price))
      .catch(err => {
        this.flashError(
          "Error occured: could not receive current SBD price from CoinMarketCap"
        );
      });
  }
}
