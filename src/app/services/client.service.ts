import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppModule } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  readonly CONVERTER_URL = AppModule.URL;
  
  constructor(private httpClient: HttpClient) {
  }

  getStatus() {
    return this.httpClient.get<StatusDto>(this.CONVERTER_URL + "/status");
  }

  initDownload(url: string) {
    return this.httpClient.post<string>(this.CONVERTER_URL + "/download?url=" + url, null);
  }

  cleanSongsNames() {
    return this.httpClient.request('GET', this.CONVERTER_URL + "/songs/clean");
  }
  
  stopDownload() {
    return this.httpClient.delete<string>(this.CONVERTER_URL + "/download");
  }

  downloadSong(songName: string) {
    return this.httpClient.request('GET', this.CONVERTER_URL + "/songs/" + songName, { responseType: 'blob', observe: 'response'});
  }

  downloadAllSongs() {
    return this.httpClient.request('GET', this.CONVERTER_URL + "/songs", { responseType: 'blob', observe: 'response'});
  }

  deleteAllSongs() {
    return this.httpClient.delete<string>(this.CONVERTER_URL + "/songs?ext=.mp3");
  }

  deleteSong(songName: string) {
    return this.httpClient.delete<string>(this.CONVERTER_URL + "/songs/" + songName);
  }
}

export interface SongDto {
  name: string;
  status: string;
  sizeNumber: number;
  sizeUnit: string;
}

export interface StatusDto {
  downloadOngoing: boolean;
  totalSizeNumber: number;
  totalSizeUnit: string;
  songs: SongDto[];
}