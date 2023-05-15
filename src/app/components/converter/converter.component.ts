import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService, SongDto } from '../../services/client.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit {
  isLoadingFirstTime: boolean = true;
  isDownloadOngoing: boolean = false;
  isInititing: boolean = false;

  songs: SongDto[] = [];
  totalSizeNumber: number = 0;
  totalSizeUnit: string = "";
  url: string = "";
  message: string = "";
  messageTime: number = 3000;
  refreshTime: number = 3000;
  bulkDownloadInProgress: boolean = false;
  singleSongDownloadInProgress: string = "";

  constructor(private client: ClientService, private _snackBar: MatSnackBar) { }

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

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      verticalPosition: 'top',
    });
  }

  getSongsStatus() {
    this.client.getStatus().subscribe({
      next: (status) => {
        if (this.isDownloadOngoing == true && status.downloadOngoing == false) {
          this.client.cleanSongsNames().subscribe();
          this.showMessage("Download finished");
          this.openSnackBar("Download finished")
        }
        this.isDownloadOngoing = status.downloadOngoing;
        this.songs = status.songs;
        this.totalSizeNumber = status.totalSizeNumber;
        this.totalSizeUnit = status.totalSizeUnit;
        this.isLoadingFirstTime = false;
      },
      error: (error) => {
        this.isLoadingFirstTime = false;
        this.showMessage(error);
      }
    });
  }

  initServerDownload() {
    if (!this.isLinkValid()) {
      return;
    }
    this.showMessage("Initializing download...");
    this.isInititing = true;
    this.client.initDownload(this.url).subscribe(result => {
      this.isInititing = false;
      this.url = "";
      this.getSongsStatus();
      this.showMessage("Download started");
    });
  }

  isLinkValid() {
    if (this.url.trim() == "" || this.url.indexOf("youtube") < 0) {
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
    this.showMessage("Stopping download...");
    this.isInititing = true;
    this.client.stopDownload().subscribe(result => {
      this.isInititing = false;
      this.getSongsStatus();
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
      this.showMessage('All songs deleted')
    });
  }

  deleteSong(songName: string) {
    this.client.deleteSong(songName).subscribe(result => {
      this.getSongsStatus();
      this.showMessage('Song deleted: ' + songName)
    });
  }
}