import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";

@Component({
  selector: "app-account-info",
  templateUrl: "./account-info.component.html",
  styleUrls: ["./account-info.component.css"]
})
export class AccountInfoComponent implements OnInit {
  public vote_value: number = 0.0;
  public voting_power: number = 0.0;
  constructor(private steemService: SteemService) {}

  ngOnInit() {
    //this.steemService.getVoteValue()
  }
}
