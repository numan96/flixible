import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { mergeMap, pipe } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { MovieData } from '../data.model';
import { Films } from '../films.model';
import * as FilmsActions from '../store/films.actions';
import { ViewfilmsService } from '../viewfilms.service';

@Injectable()
export class FilmsEffects {
  webUrl = 'https://image.tmdb.org/t/p/w500';
  value1: number;
  //maybe can change which api it uses based on if its most popular, now playing, top rated etc.
  fetchPopularFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.FetchPopularFilms),
      withLatestFrom(this.store.select('films')),
      switchMap((filterFilm) => {
        return this.http
          .get<Films[]>(
            'https://api.themoviedb.org/3/movie/popular?api_key=3bf7fc56ee01b081668e7df85a3d2155&language=en-US&page=1'
          )
          .pipe(
            map((data) =>
              data['results'].map((obj) => {
                return {
                  original_title: obj.original_title,
                  id: obj.id,
                  genres: obj.genre_ids,
                  overview: obj.overview,
                  popularity: obj.popularity,
                  release_date: obj.release_date,
                  poster_path: this.webUrl.concat('', obj.poster_path),
                  vote_average: obj.vote_average * 10,
                  favourited: false,
                };
              })
            )
          );
      }),
      map((films) => {
        return FilmsActions.SetFilms({ films });
      })
    )
  );

  fetchNowPlayingFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.FetchNowPlayingFilms),
      withLatestFrom(this.store.select('films')),
      switchMap((filterFilm) => {
        return this.http
          .get<Films[]>(
            'https://api.themoviedb.org/3/movie/now_playing?api_key=3bf7fc56ee01b081668e7df85a3d2155&language=en-US&page=1'
          )
          .pipe(
            map((data) =>
              data['results'].map((obj) => {
                return {
                  original_title: obj.original_title,
                  id: obj.id,
                  genres: obj.genre_ids,
                  overview: obj.overview,
                  popularity: obj.popularity,
                  release_date: obj.release_date,
                  poster_path: this.webUrl.concat('', obj.poster_path),
                  vote_average: obj.vote_average * 10,
                };
              })
            )
          );
      }),
      map((films) => {
        return FilmsActions.SetFilms({ films });
      })
    )
  );

  fetchUpcomingFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.FetchUpcomingFilms),
      withLatestFrom(this.store.select('films')),
      switchMap((filterFilm) => {
        return this.http
          .get<Films[]>(
            'https://api.themoviedb.org/3/movie/upcoming?api_key=3bf7fc56ee01b081668e7df85a3d2155&language=en-US&page=1'
          )
          .pipe(
            map((data) =>
              data['results'].map((obj) => {
                return {
                  original_title: obj.original_title,
                  id: obj.id,
                  genres: obj.genre_ids,
                  overview: obj.overview,
                  popularity: obj.popularity,
                  release_date: obj.release_date,
                  poster_path: this.webUrl.concat('', obj.poster_path),
                  vote_average: obj.vote_average * 10,
                };
              })
            )
          );
      }),
      map((films) => {
        return FilmsActions.SetFilms({ films });
      })
    )
  );

  fetchTopRatedFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.FetchTopRatedFilms),
      withLatestFrom(this.store.select('films')),
      switchMap((filterFilm) => {
        return this.http
          .get<Films[]>(
            'https://api.themoviedb.org/3/movie/top_rated?api_key=3bf7fc56ee01b081668e7df85a3d2155&language=en-US&page=1'
          )
          .pipe(
            map((data) =>
              data['results'].map((obj) => {
                console.log(data);
                return {
                  original_title: obj.original_title,
                  id: obj.id,
                  genres: obj.genre_ids,
                  overview: obj.overview,
                  popularity: obj.popularity,
                  release_date: obj.release_date,
                  poster_path: this.webUrl.concat('', obj.poster_path),
                  vote_average: obj.vote_average * 10,
                };
              })
            )
          );
      }),
      map((films) => {
        return FilmsActions.SetFilms({ films });
      })
    )
  );

  fetchSingleFilm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.FetchSingleFilm),
      withLatestFrom(this.store.select('films')),
      switchMap((filterFilm) => {
        return this.http
          .get<Films>(
            'https://api.themoviedb.org/3/movie/' +
              filterFilm[0].id +
              '?api_key=3bf7fc56ee01b081668e7df85a3d2155&language=en-US&append_to_response=videos,images,credits'
          )
          .pipe(
            map((data) => {
              return {
                original_title: data.original_title,
                id: data.id,
                genres: data.genres,
                overview: data.overview,
                popularity: data.popularity,
                release_date: data.release_date,
                poster_path: this.webUrl.concat('', data.poster_path),
                vote_average: data.vote_average * 10,
                runtime: this.calculateRuntime(data.runtime),
                videos: data.videos['results'],
                credits: data.credits['cast'],
                crew: data.credits['crew'],
              };
            })
          );
      }),
      map((film) => {
        console.log('Film Set:', film);
        return FilmsActions.SetFilm({ film });
      })
    )
  );

  calculateRuntime(runtime: number) {
    var hours = Math.floor(runtime / 60);
    var minutes = runtime % 60;
    return hours + 'h ' + minutes + 'm';
  }

  searchFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.SearchFilms),
      withLatestFrom(this.store.select('films')),
      switchMap((filmSearch) => {
        return this.http
          .get<Films[]>(
            'https://api.themoviedb.org/3/search/movie?api_key=3bf7fc56ee01b081668e7df85a3d2155&query=' +
              filmSearch[0].filmName +
              '&language=en-US&append_to_response=videos'
          )
          .pipe(
            map((data) =>
              data['results'].map((obj) => {
                console.log(filmSearch[0].filmName);
                return {
                  original_title: obj.original_title,
                  id: obj.id,
                  genres: obj.genre_ids,
                  overview: obj.overview,
                  popularity: obj.popularity,
                  release_date: obj.release_date,
                  poster_path: this.webUrl.concat('', obj.poster_path),
                  vote_average: obj.vote_average * 10,
                };
              })
            )
          );
      }),
      map((films) => {
        console.log('search film:', films);
        return FilmsActions.SetSearchFilms({ films });
      })
    )
  );

  setAsFavourite$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FilmsActions.setAsFavourite),
        withLatestFrom(this.store.select('auth')),
        switchMap(([data, favouriteData]) => {
          return this.http.put(
            'https://ng-flixible-default-rtdb.europe-west1.firebasedatabase.app/favourites' +
              '/' +
              favouriteData.user['id'] +
              '/' +
              data.filmId +
              '/' +
              data.filmName +
              '.json',

            data.favourite
          );
        }),
        map((recipes) => {
          console.log(recipes);
        })
      ),
    { dispatch: false }
  );

  RemoveFavouriteFromList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.RemoveFavouriteFromList),
      withLatestFrom(this.store.select('auth')),
      switchMap(([data, favouriteData]) => {
        return this.http.put(
          'https://ng-flixible-default-rtdb.europe-west1.firebasedatabase.app/favourites' +
            '/' +
            favouriteData.user['id'] +
            '/' +
            data.filmId +
            '/' +
            data.filmName +
            '.json',

          data.favourite
        );
      }),
      map(() => {
        return FilmsActions.fetchUsersFavourites();
      })
    )
  );
  fetchInitialFavourite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.fetchInitialFavourite),
      withLatestFrom(this.store.select('auth')),
      switchMap(([filmId, auth]) => {
        return this.http
          .get<boolean>(
            'https://ng-flixible-default-rtdb.europe-west1.firebasedatabase.app/favourites/' +
              auth.user['id'] +
              '/' +
              filmId.filmId +
              '.json'
          )
          .pipe(
            map((data) => {
              if (!data) {
                return FilmsActions.setInitialFavourite({ favourite: false });
              }

              var favValue = Object.values(data);
              var fav = favValue.toString();
              var fav1 = JSON.parse(fav);
              console.log(fav1);

              return FilmsActions.setInitialFavourite({ favourite: fav1 });
            })
          );
      })
    )
  );

  fetchUsersFavourites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FilmsActions.fetchUsersFavourites),
      withLatestFrom(this.store.select('auth')),
      mergeMap(([filmId, auth]) => {
        return this.http
          .get<MovieData>(
            'https://ng-flixible-default-rtdb.europe-west1.firebasedatabase.app/favourites/' +
              auth.user['id'] +
              '.json'
          )
          .pipe(
            map((data) => {
              return FilmsActions.setUsersFavourites({
                favouriteList: data,
              });
            })
          );
        // .pipe(
        //   map((data) => {
        //     return FilmsActions.fetchFavouriteListDetails({
        //       filmIds: data.favouriteList,
        //     });
        //   })
        // );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private vfService: ViewfilmsService,
    private store: Store<fromApp.AppState>
  ) {}
}
