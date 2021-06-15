import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

export interface Data {
  genius_access_token: string;
}
@Injectable({
  providedIn: 'root',
})
export class GeniusService {
  private sadDoc: AngularFirestoreDocument<Data>;
  private sad: Observable<Data>;
  private searchUrl: string;
  private access_token: string;
  html: string;
  lyricHTML: string;
  constructor (private afs: AngularFirestore) { }

  searchLyrics (title: string, artist: string) {
    title = title.replace(/ \(.*?\)/g, '');
    title = title.split(' -')[0];
    artist = artist.split(',')[0];
    const query = title + ' - ' + artist;
    console.log('Genius Lyrics Query: ' + query);
    // reference to firestore collection
    this.sadDoc = this.afs.doc('SecretAccountData/' + 'SAD');
    this.sad = this.sadDoc.valueChanges(); // Observable of Secret Data
    const sad$: Subscription = this.sad.subscribe(
      async e => {
        // stores access_token from firestore
        this.access_token = e.genius_access_token;
        console.log(this.access_token);
        this.searchUrl =
          'https://api.genius.com/search?access_token=' + this.access_token + '&q=' + encodeURIComponent(query);
        const reply = fetch(this.searchUrl).then(response => {
          return response.json();
        });
        try {
          try {
            const res = await reply;
            console.log('https://api.allorigins.win/get?url=' + res.response.hits[0].result.url + '&callback=?');
            await $.getJSON(
              'https://api.allorigins.win/get?url=' + res.response.hits[0].result.url + '&callback=?',
              data => {
                // this.html = data.contents;
                // console.log(this.html);
              }
            ).done(async (data_1) => {
              // console.log(data_1.contents);
              this.lyricHTML = this.extractLyrics(data_1.contents);
              $('#lyrics').html(this.lyricHTML);
              sad$.unsubscribe();
            });
          } catch (err) {
            console.log('Error:' + err.toString());
          }
        } catch (err_1) {
          console.log('Error: ' + err_1);
        }
      },
      err => {
        console.log('Error:' + err);
      }
    );
  }
  extractLyrics (html: string) {
    // Parses the Genius lyrics html string to a jQuery HTMLElement
    const lyricEl = $('<div></div>');
    lyricEl.html(html);
    // Selects the lyrics section
    let lyric = $('.dVtOne, [class^="Lyrics__Container"]', lyricEl).toArray().map(section => section.innerHTML).join('');
    // Cleans up the unneeded html code
    lyric = lyric.replace(/<a/g, '<p'); // replaces the opening a tags with opening p tags
    lyric = lyric.replace(/<\/a>/g, '</p>'); // replaces the closing a tags with closing p tags
    lyric = lyric.replace(/’/g, "'"); // removes the curly apostrophes */
    // console.log(lyric);
    return lyric;
  }
}
