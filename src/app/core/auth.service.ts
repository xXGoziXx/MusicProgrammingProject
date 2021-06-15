import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/app'
import 'firebase/auth';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from './user-type';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User>;
  userRef: AngularFirestoreDocument;
  currentUserDoc: User;
  constructor (private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    // Get auth data, then get firestore user document || null
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.userRef = this.afs.doc<User>(`users/${user.uid}`);
          return this.userRef.valueChanges();
        } else {
          return of(null);
        }
      })
    );
    this.user$.subscribe(userData => {
      this.currentUserDoc = userData;
    });
  }

  googleLogin () {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin (provider) {
    return this.afAuth.signInWithPopup(provider).then(credential => {
      // If its a new user
      if (credential.additionalUserInfo.isNewUser) {
        this.updateUserData(credential.user);
      }
    });
  }

  private updateUserData (user) {
    // Sets user data to firestore on login

    console.log(this.userRef);
    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      playedTracks: null,
    };

    return this.userRef.set(data, { merge: true });
  }

  signOut () {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
