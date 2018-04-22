import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CoinmarketcapService {
  constructor(private http: HttpClient) {}

  private getPrice(ticker: String): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http
        .get("https://api.coinmarketcap.com/v1/ticker/" + ticker + "/")
        .subscribe(
          data => {
            resolve(parseFloat(data[0].price_usd));
          },
          error => {
            reject(error);
          }
        );
    });
  }

  public getSteemPrice(): Promise<number> {
    return this.getPrice("steem");
  }

  public getSBDPrice(): Promise<number> {
    return this.getPrice("steem-dollars");
  }
}
