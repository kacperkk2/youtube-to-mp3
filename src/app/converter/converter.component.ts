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

  constructor(private client: ClientService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    setTimeout( () => {
      this.refreshTick();
    }, 3000);
  }

  refreshTick() {
    this.getSongsStatus();
    this.refresh();
  }

  getSongsStatus() {
    this.client.getStatus().subscribe(songs => {
      this.songs = songs;
    });
  }

  initServerDownload() {
    this.client.initDownload(this.url).subscribe(result => {
      console.log(result);
    });
  }

  downloadSong(songName: string) {
    this.client.downloadSong(songName).subscribe(data => {
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
}
