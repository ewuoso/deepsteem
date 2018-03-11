import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { ChartsModule } from "ng2-charts";

import { AppComponent } from "./app.component";

import { SteemService } from "./steem.service";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, ChartsModule],
  providers: [SteemService],
  bootstrap: [AppComponent]
})
export class AppModule {}
