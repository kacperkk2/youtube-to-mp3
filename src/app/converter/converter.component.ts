import { Component, OnInit } from '@angular/core';
import { ClientService, SongDto } from '../services/client.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit {

  songs: SongDto[] = [];
  url: string = "";
  downloadStatus: DOWNLOAD_STATUS = DOWNLOAD_STATUS.NO;
  downloadStatuses = DOWNLOAD_STATUS;
  showBulkButtons: boolean = false;
  message: string = "";
  messageTime: number = 3000;
  refreshTime: number = 3000;

  constructor(private client: ClientService) { }

  ngOnInit(): void {
    this.getSongsStatus();
    this.refresh();
  }

  refresh() {
    setTimeout( () => {
      this.refreshTick();
    }, this.refreshTime);
  }

  showMessage(message: string) {
    this.message = message;
    setTimeout( () => {
      this.message = "";
    }, this.messageTime);
  }

  refreshTick() {
    this.getSongsStatus();
    this.refresh();
  }

  getSongsStatus() {
    this.client.getStatus().subscribe(songs => {
      if (songs.filter(song => song.status != 'ready').length > 0) {
        this.downloadStatus = DOWNLOAD_STATUS.ONGOING;
      }
      else if (this.downloadStatus != DOWNLOAD_STATUS.PRE) {
        this.downloadStatus = DOWNLOAD_STATUS.NO;
      }
      if (songs.filter(song => !song.name.endsWith("part")).length > 1) {
        this.showBulkButtons = true;
      }
      else {
        this.showBulkButtons = false;
      }
      this.songs = songs;
    });
  }

  initServerDownload() {
    if (!this.isLinkValid()) {
      return;
    }
    this.downloadStatus = DOWNLOAD_STATUS.PRE;
    this.client.initDownload(this.url).subscribe(result => {
      this.downloadStatus = DOWNLOAD_STATUS.ONGOING;
      this.url = "";
      console.log("download initiated");
    });
  }

  isLinkValid() {
    if (this.url.trim() == "") {
      this.showMessage("Please provide youtube link");
      return false;
    }
    else if (!this.url.startsWith("https://")) {
      this.showMessage("Invalid link. Proper link should start with https://")
      return false;
    }
    return true;
  }

  stopDownload() {
    // po poprawieniu response dac pre na czas uzyskania result
    this.client.stopDownload().subscribe(result => {
      this.downloadStatus = DOWNLOAD_STATUS.NO;
      console.log("stopped");
    });
  }

  downloadSong(songName: string) {
    console.log(songName)

    this.client.downloadSong(songName).subscribe(data => {
      console.log(data)
      const contentDisposition = data.headers.get('Content-Disposition')!;
      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      const blob = new Blob([data.body!], { type: 'application/mp3' });
      const url= window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = url;
      anchor.click();

      // let blob = new Blob([data], { type: "application/mp3"});
      // let url = window.URL.createObjectURL(blob);
      // let pwa = window.open(url);
      // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      //     alert( 'Please disable your Pop-up blocker and try again.');
      // }
    });
  }

  downloadAll() {
    this.client.downloadAllSongs().subscribe(data => {
// jakis zip?

      // const contentDisposition = data.headers.get('Content-Disposition')!;
      // var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      // const blob = new Blob([data.body!], { type: 'application/mp3' });
      // const url= window.URL.createObjectURL(blob);
      // const anchor = document.createElement("a");
      // anchor.download = filename;
      // anchor.href = url;
      // anchor.click();

      // let blob = new Blob([data], { type: "application/mp3"});
      // let url = window.URL.createObjectURL(blob);
      // let pwa = window.open(url);
      // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      //     alert( 'Please disable your Pop-up blocker and try again.');
      // }
    });
  }

  deleteAll() {
    this.client.deleteAllSongs().subscribe(result => {
      this.getSongsStatus();
    });
  }

  deleteSong(songName: string) {
  }
}

export enum DOWNLOAD_STATUS {
  NO, PRE, ONGOING
}
