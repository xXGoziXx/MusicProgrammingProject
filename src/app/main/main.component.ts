import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { PlayedTrack } from '../core/user-type';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { SpotifyService } from '../services/spotify.service';
import { GeniusService } from '../services/genius.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  songId: string;
  url: string;
  favourite: boolean;
  playCheck = false;
  playCountInterval = null;
  constructor (
    public auth: AuthService,
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private geniusService: GeniusService,
    public sanitizer: DomSanitizer
  ) {
    $(() => {
      ($('[data-toggle="tooltip"]') as any).tooltip();
      // when the favourite icon is clicked
      $('#favourite').on('click', () => {
        if (this.songId !== '') {
          this.auth.currentUserDoc.playedTracks.map(playedTrack => {
            if (playedTrack.id === this.songId) {
              playedTrack.favourites.favourited = !playedTrack.favourites.favourited;
              this.favourite = playedTrack.favourites.favourited;
            }
          });
          this.auth.userRef.update({ playedTracks: this.auth.currentUserDoc.playedTracks });
        } else {
          console.log("Song doesn't exist");
        }
      });
    });
  }
  incrementPlayCount () {
    if (!this.playCheck) {
      this.auth.currentUserDoc.playedTracks.forEach((playedTrack, i) => {
        if (playedTrack.id === this.songId) {
          this.auth.currentUserDoc.playedTracks[i].favourites.play_count += 1;
          // console.log(this.auth.currentUserDoc.playedTracks[i].favourites.play_count);
        }
      });
      this.auth.userRef.update({
        playedTracks: this.auth.currentUserDoc.playedTracks,
      });
      this.playCheck = true;
    }
  }
  updateFavouriteSettings () {
    let trackExists = false;
    // If the user is logged in
    if (this.auth.currentUserDoc !== undefined) {
      // If the user has played a track before
      console.log(this.auth.currentUserDoc);
      if (this.auth.currentUserDoc.playedTracks !== undefined) {
        this.auth.currentUserDoc.playedTracks.map(playedTrack => {
          if (playedTrack.id === this.songId) {
            trackExists = true;
          }
        });
        // If this track hasn't already been added to the users playedTracks
        if (!trackExists) {
          console.log("You've never played this track with this account before!");
          let trackData: any;
          this.spotifyService.getTrackObject(this.songId).subscribe(res => {
            trackData = res;
            // console.log('TrackData: ' + JSON.stringify(trackData));
            const data = {
              id: this.songId,
              title: trackData.name,
              artists: trackData.artists.map(artist => artist.name),
              album_name: trackData.album.name,
              released: trackData.album.release_date,
              duration: trackData.duration_ms,
              favourites: {
                rating: 0,
                favourited: false,
                play_count: 1,
              },
              image_url: trackData.album.images.map(image => image.url),
            };
            this.auth.userRef.update({
              playedTracks: firebase.firestore.FieldValue.arrayUnion(data),
            });
            this.favourite = data.favourites.favourited;
          });
        } else {
          this.auth.currentUserDoc.playedTracks.map(playedTrack => {
            if (playedTrack.id === this.songId) {
              this.favourite = playedTrack.favourites.favourited;
            }
          });
          console.log("You've played this track with this account before!");
        }
      } else {
        let trackData: any;
        this.spotifyService.getTrackObject(this.songId).subscribe(res => {
          trackData = res;
          const data: PlayedTrack = {
            id: this.songId,
            title: trackData.name,
            artists: trackData.artists.map(artist => artist.name),
            album_name: trackData.album.name,
            released: trackData.album.release_date,
            duration: trackData.duration_ms,
            favourites: {
              rating: 0,
              favourited: false,
              play_count: 1,
            },
            image_url: trackData.album.images.map(image => image.url),
          };
          this.auth.userRef.set({ playedTracks: [data] }, { merge: true });
          this.favourite = data.favourites.favourited;
        });
      }
      this.incrementPlayCount();
    }
  }

  ngOnInit () {
    // Makes songId = the hash of the URL e.g #123 = 123
    this.route.fragment.subscribe(fragment => {
      console.log('Route Updated!');
      if (fragment != null) {
        this.playCheck = false;
        const trackString = fragment.split('+');
        this.songId = trackString[0];
        $('#listen').attr('src', 'https://open.spotify.com/embed/track/' + this.songId);
        const title = decodeURIComponent(trackString[1]);
        const artist = decodeURIComponent(trackString[2]);
        const lyricsString = title + ' ' + artist;
        console.log('lyricsString:' + lyricsString);
        this.geniusService.searchLyrics(title, artist);
        this.updateFavouriteSettings();
      } else {
        console.log('Song does not exist!');
      }
    });
  }
}
