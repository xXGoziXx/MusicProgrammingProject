import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { MainComponent } from './main/main.component';

const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home' },
  },
  {
    path: 'main',
    component: MainComponent,
    data: { title: 'Main' },
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
    data: { title: 'Favourites' },
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
@NgModule({
  declarations: [AppComponent, HomeComponent, NavbarComponent, FavouritesComponent, MainComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
