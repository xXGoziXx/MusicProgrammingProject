// made this new file and copy-pasted your code over to here cause its 'service.ts'
import { Injectable } from '@angular/core';
// import { Http, Headers } from '@angular/Http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Not needed anymore
// import 'rxjs/add/operator/map'; // this was also changed in rxjs 6
// import firebase firestore for angular
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PlayedTrack } from '../core/user-type';

export interface Data {
  access_token: string;
}
@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private dataDoc: AngularFirestoreDocument<Data>;
  private data: Observable<Data>;
  private searchUrl: string;
  private access_token: string;
  constructor (private _http: HttpClient, private afs: AngularFirestore) {
    // reference to firestore collection
    this.dataDoc = this.afs.doc('SecretAccountData/' + 'SAD');
    this.data = this.dataDoc.valueChanges(); // Observable of Secret Data
    this.data.subscribe(
      e => {
        // stores access_token from firestore
        this.access_token = e.access_token;
      },
      err => {
        console.log('Error:' + err);
      }
    );
  }

  searchSpotify (str: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.access_token);
    this.searchUrl = 'https://api.spotify.com/v1/search?query=' + str + '&offset=0&limit=30&type=track';
    // because of this changes to map .json() doesn't exist anymore
    // return this._http.get(this.searchUrl).map(res => res.json());
    return this._http.get(this.searchUrl, { headers: headers });
  }
  searchRecommendations (array: Array<PlayedTrack>) {
    array = array.sort((a, b) =>
      a.favourites.rating > b.favourites.rating ? 1 : b.favourites.rating > a.favourites.rating ? -1 : 0
    );
    const strArray = array.map(track => track.id);
    const str = strArray
      .reverse()
      .slice(0, 5)
      .toString(); // return the first five elements.toString();
    console.log('Recommendation String: ' + str);
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.access_token);
    this.searchUrl = 'https://api.spotify.com/v1/recommendations?limit=20&seed_tracks=' + str;
    // return this._http.get(this.searchUrl).map(res => res.json());
    return this._http.get(this.searchUrl, { headers: headers });
  }
  displayPlaylist () {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.access_token);
    this.searchUrl = 'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF';
    // because of this changes to map .json() doesn't exist anymore
    // return this._http.get(this.searchUrl).map(res => res.json());
    return this._http.get(this.searchUrl, { headers: headers });
  }
  getTrackObject (id) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.access_token);
    this.searchUrl = 'https://api.spotify.com/v1/tracks/' + id;
    // because of this changes to map .json() doesn't exist anymore
    // return this._http.get(this.searchUrl).map(res => res.json());
    return this._http.get(this.searchUrl, { headers: headers });
  }
}
