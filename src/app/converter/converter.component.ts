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
  bulkDownloadInProgress: boolean = false;
  singleSongDownloadInProgress: string = "";

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
      this.getSongsStatus();
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
    this.downloadStatus = DOWNLOAD_STATUS.PRE;
    this.client.stopDownload().subscribe(result => {
      this.getSongsStatus();
      this.downloadStatus = DOWNLOAD_STATUS.NO;
    });
  }

  downloadSong(songName: string) {
    this.singleSongDownloadInProgress = songName;
    this.client.downloadSong(songName).subscribe(data => {
      const contentDisposition = data.headers.get('Content-Disposition')!;
      var filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      const blob = new Blob([data.body!], { type: 'audio/mpeg' });
      const url= window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = url;
      anchor.click();
      this.singleSongDownloadInProgress = "";

      // let blob = new Blob([data], { type: "application/mp3"});
      // let url = window.URL.createObjectURL(blob);
      // let pwa = window.open(url);
      // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      //     alert( 'Please disable your Pop-up blocker and try again.');
      // }
    });
  }

  // const anchor = document.createElement("a");
  // anchor.download = "a.zip";
  // anchor.href = "https://yt-to-mp3-production.up.railway.app/converter/songs";
  // anchor.click();

  downloadAll() {
    this.bulkDownloadInProgress = true;
    this.client.downloadAllSongs().subscribe(data => {
      var filename = "youtube-to-mp3.zip";
      const blob = new Blob([data.body!], { type: 'application/zip' });
      const url= window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = url;
      anchor.click();
      this.bulkDownloadInProgress = false;

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
    this.client.deleteSong(songName).subscribe(result => {
      this.getSongsStatus();
    });
  }
}

export enum DOWNLOAD_STATUS {
  NO, PRE, ONGOING
}
