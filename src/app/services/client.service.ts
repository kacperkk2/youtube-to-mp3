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
    return this.httpClient.get<SongDto[]>(this.CONVERTER_URL + "/status");
  }

  initDownload(url: string) {
    return this.httpClient.post<string>(this.CONVERTER_URL + "/init?url=" + url, null);
  }
  
  stopDownload() {
    return this.httpClient.delete<string>(this.CONVERTER_URL + "/stop");
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
}

export interface SongDto {
  name: string;
  status: string;
}