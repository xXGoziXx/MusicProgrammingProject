import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { SpotifyService } from '../services/spotify.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { User, PlayedTrack } from '../core/user-type';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss'],
})
export class FavouritesComponent implements OnInit {
  favouriteTracks: Array<PlayedTrack> = [];
  recommendations: Array<SpotifyApi.TrackObjectSimplified>;
  searchStr: string;
  constructor (private afs: AngularFirestore, private spotifyService: SpotifyService, public auth: AuthService) {
    let searchRecommendations$: Subscription;
    // If the user is logged in
    if (this.auth.currentUserDoc !== null) {
      this.favouriteTracks = this.auth.currentUserDoc.playedTracks.filter(track => {
        return track.favourites.favourited;
      });
      searchRecommendations$ = this.spotifyService
        .searchRecommendations(this.favouriteTracks)
        .subscribe((recommendationsObj: SpotifyApi.RecommendationsObject) => {
          this.recommendations = recommendationsObj.tracks;
          // console.log(
          //   'Recommendations: ' +
          //     this.recommendations.map(track =>
          //       JSON.stringify((track as any).artists)
          //     )
          // );
        });
      $('.track-info, .user-info', () => {
        $('.track-info, .user-info').hide();
      });
      $(() => {
        ($('[data-toggle="tooltip"]') as any).tooltip();
        $('.rating mat-icon').on(
          'hover',
          (e: { currentTarget: any }) => {
            // console.log('hovered: ' + $(e.currentTarget).attr('id'));
            $(e.currentTarget).addClass('hover');
            $(e.currentTarget)
              .prevUntil('b')
              .addClass('hover');
          },
          e => {
            $(e.currentTarget).removeClass('hover');
            $(e.currentTarget)
              .prevUntil('b')
              .removeClass('hover');
          }
        );
      });
    } else {
      if (searchRecommendations$) {
        searchRecommendations$.unsubscribe();
      }
    }
  }

  updateRating (e: { currentTarget: any }) {
    const ratingEl = $(e.currentTarget)
      .attr('id')
      .split('-');
    const track_id = ratingEl[2];
    const rating = parseInt(ratingEl[1], 10);
    console.log(ratingEl.toString());
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${this.auth.currentUserDoc.uid}`);
    this.auth.currentUserDoc.playedTracks.forEach((playedTrack, i) => {
      if (playedTrack.id === track_id) {
        this.auth.currentUserDoc.playedTracks[i].favourites.rating = rating;
      }
    });
    userRef
      .update({
        playedTracks: this.auth.currentUserDoc.playedTracks,
      })
      .then(() => {
        this.switchToUserInfo(track_id);
      });
  }
  setRating (id: string) {
    const index = this.favouriteTracks.findIndex(obj => obj.id === id);
    return this.favouriteTracks[index].favourites.rating;
  }
  setFavourited (id: string) {
    const index = this.favouriteTracks.findIndex(obj => obj.id === id);
    const favourited = this.favouriteTracks[index].favourites.favourited;
    // removes the current favourited value of the specified track
    this.auth.userRef.update({
      playedTracks: firebase.firestore.FieldValue.arrayRemove(this.favouriteTracks[index]),
    });
    this.favouriteTracks[index].favourites.favourited = favourited ? false : true;
    // replaces the favourited value of this track with the new one
    this.auth.userRef.update({
      playedTracks: firebase.firestore.FieldValue.arrayUnion(this.favouriteTracks[index]),
    });
  }

  artists2String (artists: { forEach: (arg0: (artist: any, i: any) => void) => void }) {
    let result = '';
    artists.forEach((artist: { name: string }, i: number) => {
      if (i === 0) {
        result += artist.name;
      } else {
        result += ', ' + artist.name;
      }
    });
    return result;
  }
  switchToAlbumCover (id: string) {
    $('#' + id + '.track-info, #' + id + '.user-info').hide();
    $('#' + id + '.album-cover').show();
  }
  switchToUserInfo (id: string) {
    $('#' + id + '.track-info, #' + id + '.album-cover').hide();
    $('#' + id + '.user-info').show();
  }
  switchToTrackInfo (id: string) {
    $('#' + id + '.user-info, #' + id + '.album-cover').hide();
    $('#' + id + '.track-info').show();
  }
  playTrack (id: string, name: string | number | boolean, artists: string | number | boolean) {
    window.location.href = 'main#' + id + '+' + encodeURIComponent(name) + '+' + encodeURIComponent(artists);
  }
  millisToMinutesAndSeconds (millis: number) {
    const seconds = Math.floor((millis / 1000) % 60);
    const minutes = Math.floor(millis / 60000);
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }
  strReplace (str: { replace: (arg0: RegExp, arg1: string) => void }) {
    return str.replace(/,/g, ', ');
  }
  ngOnInit () { }
}
