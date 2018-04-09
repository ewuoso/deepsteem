import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.css"]
})
export class NavBarComponent implements OnInit {
  public account_name: String = "nafestw";

  constructor(private steemService: SteemService) {}

  accountChanged(newName) {
    newName = newName.toLowerCase();
    this.account_name = newName;
    localStorage.setItem("account_name", newName);
    this.steemService.setAccountName(newName);
    return newName;
  }

  ngOnInit() {
    let stored_account_name = localStorage.getItem("account_name");
    if (stored_account_name) this.account_name = stored_account_name;
    this.steemService.setAccountName(stored_account_name);
  }
}
