import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { CoinmarketcapService } from "../coinmarketcap.service";

@Component({
  selector: "app-steem-stats",
  templateUrl: "./steem-stats.component.html",
  styleUrls: ["./steem-stats.component.css"]
})
export class SteemStatsComponent implements OnInit {
  public sbd_print_rate: number = 0;
  public median_price: number = 0;
  public steem_price: number = 0;
  constructor(
    private steemService: SteemService,
    private cmcService: CoinmarketcapService
  ) {}

  ngOnInit() {
    this.steemService
      .getCurrentMedianHistoryPrice()
      .then(mhp => (this.median_price = mhp.price()));

    this.steemService
      .getDynamicGlobalProperties()
      .then(dgp => (this.sbd_print_rate = dgp.sbd_print_rate / 100.0));

    this.cmcService.getSteemPrice().then(price => (this.steem_price = price));
  }
}
