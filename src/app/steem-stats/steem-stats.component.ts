import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";

@Component({
  selector: "app-steem-stats",
  templateUrl: "./steem-stats.component.html",
  styleUrls: ["./steem-stats.component.css"]
})
export class SteemStatsComponent implements OnInit {
  public sbd_print_rate: number = 0;
  public steem_price: number = 0;
  constructor(private steemService: SteemService) {}

  ngOnInit() {
    this.steemService
      .getCurrentMedianHistoryPrice()
      .then(mhp => (this.steem_price = mhp.base));

    this.steemService
      .getDynamicGlobalProperties()
      .then(dgp => (this.sbd_print_rate = dgp.sbd_print_rate / 100.0));
  }
}
