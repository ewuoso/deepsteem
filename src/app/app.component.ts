import { Component } from "@angular/core";
import * as steem from "steem";
import config from "./config";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public show_promo_link: boolean = config.show_promo_link;
  constructor() {}

  ngOnInit() {}
}
