import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { SpotifyService } from '../services/spotify.service';
import { User, Favourites, PlayedTrack } from '../core/user-type';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, Subscription } from 'rxjs';
import * as $ from 'jquery';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  albumsobj: Array<any>;
  constructor(private _spotifyService: SpotifyService, private afs: AngularFirestore) {
    // reference to firestore collection
    const dataDoc = this.afs.doc('SecretAccountData/' + 'SAD');
    const data = dataDoc.valueChanges(); // Observable of Secret Data
    data.subscribe(
      e => {
        // stores access_token from firestore
        const displayplaylist = this._spotifyService.displayPlaylist().subscribe(res => {
          this.albumsobj = (res as any).tracks.items;
          console.log(this.albumsobj);
          displayplaylist.unsubscribe();
        });
      },
      err => {
        console.log('Error:' + err);
      }
    );
  }

  playTrack(id, name, artists) {
    window.location.href = 'main#' + id + '+' + encodeURIComponent(name) + '+' + encodeURIComponent(artists);
  }

  ngOnInit() {}
}
