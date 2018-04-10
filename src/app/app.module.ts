import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ChartsModule } from "ng2-charts";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";

import { SteemService } from "./steem.service";
import { EtaPipe } from "./eta.pipe";
import { SteemStatsComponent } from "./steem-stats/steem-stats.component";
import { PromoLinkComponent } from "./promo-link/promo-link.component";
import { AccountInfoComponent } from "./account-info/account-info.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { CoinmarketcapService } from "./coinmarketcap.service";
import { DashBoardComponent } from "./dash-board/dash-board.component";
import { RewardHistoryComponent } from "./reward-history/reward-history.component";
import { FollowersComponent } from "./followers/followers.component";

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashBoardComponent },
  { path: "rewardhistory", component: RewardHistoryComponent },
  { path: "followers", component: FollowersComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    EtaPipe,
    SteemStatsComponent,
    PromoLinkComponent,
    AccountInfoComponent,
    NavBarComponent,
    DashBoardComponent,
    RewardHistoryComponent,
    FollowersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ChartsModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [SteemService, CoinmarketcapService],
  bootstrap: [AppComponent]
})
export class AppModule {}
