import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppModule } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  readonly USERS_URL = AppModule.URL;
  
  constructor(private httpClient: HttpClient) {
  }

  getStatus() {
    return this.httpClient.get<SongDto[]>(this.USERS_URL + "/status");
  }

  initDownload(url: string) {
    return this.httpClient.post<string>(this.USERS_URL + "/init?url=" + url, null);
  }

  downloadSong(songName: string) {
    return this.httpClient.request('GET', this.USERS_URL + "/songs/" + songName, { responseType: 'blob', observe: 'response'});
  }
}

export interface SongDto {
  name: string;
  status: string;
}