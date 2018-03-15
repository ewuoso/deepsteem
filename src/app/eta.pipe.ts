import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "ETA"
})
export class EtaPipe implements PipeTransform {
  transform(seconds: number, args?: any): String {
    if (seconds < 60) return Math.floor(seconds) + " s";
    if (seconds < 60 * 60) return Math.floor(seconds / 60) + " m";
    if (seconds < 60 * 60 * 24) return Math.floor(seconds / (60 * 60)) + " h";
    return Math.floor(seconds / (60 * 60 * 24)) + " d";
  }
}
