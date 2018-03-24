import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ChartsModule } from "ng2-charts";

import { AppComponent } from "./app.component";

import { SteemService } from "./steem.service";
import { EtaPipe } from "./eta.pipe";
import { SteemStatsComponent } from "./steem-stats/steem-stats.component";
import { PromoLinkComponent } from "./promo-link/promo-link.component";
import { AccountInfoComponent } from "./account-info/account-info.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { CoinmarketcapService } from "./coinmarketcap.service";

@NgModule({
  declarations: [
    AppComponent,
    EtaPipe,
    SteemStatsComponent,
    PromoLinkComponent,
    AccountInfoComponent,
    NavBarComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, ChartsModule],
  providers: [SteemService, CoinmarketcapService],
  bootstrap: [AppComponent]
})
export class AppModule {}
