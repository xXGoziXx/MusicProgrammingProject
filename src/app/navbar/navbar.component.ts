import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import * as $ from 'jquery';
import { AuthService } from '../core/auth.service';
// import { GeniusService } from '../services/genius.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [SpotifyService],
})
export class NavbarComponent implements OnInit {
  searchStr: string;
  user: any;

  constructor(private spotifyService: SpotifyService, public auth: AuthService) {}

  ngOnInit() {}

  searchTracks() {
    console.log(this.searchStr);
    if (this.searchStr !== '') {
      this.spotifyService.searchSpotify(this.searchStr).subscribe(
        res => {
          console.log((res as any).tracks.items);
          // console.log((res as any).tracks.items.length);
          // console.log((res as any).tracks.items[0].artists.length);
          // const trackAmount = (res as any).tracks.items.length;
          let artists;
          let track;
          let image;
          let trackId;
          const element = document.getElementById('drop');

          element.innerHTML = ' ';
          for (let i = 0; i < 10; i++) {
            trackId = (res as any).tracks.items[i].id;
            // console.log('search tracks:' + (res as any).tracks.items[i].id);
            artists = ' ';
            const artistsAmount = (res as any).tracks.items[i].artists.length;
            // console.log((res as any).tracks.items[i].name);
            track = (res as any).tracks.items[i].name;
            // console.log((res as any).tracks.items[i].album.images[1].url);
            image = (res as any).tracks.items[i].album.images[1].url;

            for (let j = 0; j < artistsAmount; j++) {
              // console.log((res as any).tracks.items[i].artists[j].name);
              if (j > 0) {
                artists += ', ' + (res as any).tracks.items[i].artists[j].name;
              }
              // tslint:disable-next-line:one-line
              else {
                artists = (res as any).tracks.items[i].artists[j].name;
              }
            }
            const divy = document.createElement('div');
            const atag = document.createElement('a');
            const breaky = document.createElement('br');
            const p1 = document.createElement('p');
            const p2 = document.createElement('p');

            const imageDiv = document.createElement('div');

            const trackList = document.createTextNode(track);
            const artistList = document.createTextNode(artists);
            p1.appendChild(trackList);
            p2.appendChild(artistList);
            p1.append(p2);
            atag.appendChild(p1);
            // atag.innerHTML = (track + ' : ' + artists);
            atag.setAttribute(
              'href',
              'main#' + trackId + '+' + encodeURIComponent(track) + '+' + encodeURIComponent(artists)
            );
            atag.setAttribute('class', 'dropdown-item overflow');
            imageDiv.setAttribute('class', 'imageContainer');
            imageDiv.setAttribute('src', image);
            // divy.appendChild(atag);
            // element.appendChild(image);
            element.appendChild(imageDiv);
            element.appendChild(atag);
          }
          // console.log((res as any).tracks.items[0].name);
          // console.log((res as any).tracks.items[0].artists[0].name);
        },
        err => {
          console.log('Error:' + err);
        }
      );
    } else {
      const element = document.getElementById('drop');
      element.innerHTML = ' ';
    }
  }
}
