import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CoinmarketcapService {
  constructor(private http: HttpClient) {}

  public getSteemPrice(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.get("https://api.coinmarketcap.com/v1/ticker/steem/").subscribe(
        data => {
          resolve(parseFloat(data[0].price_usd));
        },
        error => {
          reject(error);
        }
      );
    });
  }
}
