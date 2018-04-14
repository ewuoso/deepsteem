import { Component, OnInit } from "@angular/core";
import { SteemService } from "../steem.service";
import { DomSanitizer } from "@angular/platform-browser";
import config from "../config";

@Component({
  selector: "app-promo-link",
  templateUrl: "./promo-link.component.html",
  styleUrls: ["./promo-link.component.css"]
})
export class PromoLinkComponent implements OnInit {
  public url: any = null;
  public title: String = null;
  constructor(
    private steemService: SteemService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.steemService.getPosts(config.default_account, 1).then(posts => {
      if (posts.length == 1) {
        let post = posts[0];
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          "https://steemit.com/@" + post.author + "/" + post.permlink
        );
        this.title = post.title;
      }
    });
  }
}
