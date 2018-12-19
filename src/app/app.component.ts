import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';

// Models
import { Movie } from './movie';

// Components
import { DialogDetailsComponent } from '@app/dialogs/dialog-details/dialog-details.component';

// Services
import { MovieStorageService } from '@app/_services/movie-storage-service';
import { FavoritesService } from '@app/_services/favorites-service';

// Imports
import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    consoleTextColorService = 'color: salmon;';

    api_key = 'bb89d1ca9039938e89d75ef50cbd137d';
    API_URLS = [
        'https://api.themoviedb.org/3/movie/popular?api_key=',
        'https://api.themoviedb.org/3/genre/movie/list?api_key=',
        'https://api.themoviedb.org/3/search/movie?api_key=',
        'https://api.themoviedb.org/3/movie/'
    ];
    localePart = '&language=en-US';
    pagePart = 'page=';

    genres: Object = {};
    pageNumber = 1;
    // defaultPage = true;
    public form: FormGroup;
    selectedIndex = 0;

    constructor(
        private _httpClient: HttpClient,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog,
        private _movieStorageService: MovieStorageService,
        private _favService: FavoritesService) {
        this.form = _formBuilder.group({
            searchField: ['']
        });

        this._favService.favoriteList = this._favService.loadFavoriteList();
        console.log('%cfavoriteList: ', this.consoleTextColorService, this._favService.favoriteList);

        this.form.valueChanges.pipe(
            debounceTime(700),
            distinctUntilChanged(),
        ).subscribe(value => {
            console.log('value: ', value);
            this.searchMovie();
        });
    }

    ngOnInit() {

        this._httpClient.get(this.API_URLS[1] + this.api_key + this.localePart).pipe(
            map(response => {
                // console.log('%cincoming response: ', this.consoleTextColorService, response);
                return response['genres'];
            })).subscribe((response) => {
                // console.log('%c genre response: ', this.consoleTextColorService, response);

                response.map(value => {
                    this.genres[value['id']] = value['name'];
                });

                console.log('%c genres: ', this.consoleTextColorService, this.genres);
                // console.log('%c genre 10402: ', this.consoleTextColorService, this.genres['10402']);

                this.getMovies();
            });
    }

    getMovies() {
        console.log('%cCall API!', this.consoleTextColorService);
        this.getMoviesPopularList(this.pageNumber).subscribe((response) => {
            console.log('%cresponse: ', this.consoleTextColorService, response);

            this._movieStorageService.movieList = [];

            response.map(item => {
                const newMovie = new Movie(
                    item['id'],
                    item['title'],
                    item['genre_ids'],
                    item['backdrop_path'],
                    item['poster_path'],
                    item['popularity'],
                    item['overview'],
                    item['vote_average']
                );

                this._favService.favoriteList.map(movie => {
                    if (movie.id === newMovie.id) {
                        newMovie.favorite = true;
                    }
                });

                const genre_list = [];
                newMovie.genre_ids.map(id => {
                    genre_list.push(this.genres[id]);
                    // console.log(id + ' ' + this.genres[id]);
                });

                // console.log('genre_list: ' + genre_list);
                newMovie.genre_list = genre_list;

                this._movieStorageService.movieList.push(newMovie);
            });

            console.log('%cmovieList: ', this.consoleTextColorService, this._movieStorageService.movieList);
        });
    }

    // GET movies
    getMoviesPopularList(pageNumber: number): Observable<Movie[]> {
        return this._httpClient.get(this.API_URLS[0] + this.api_key + this.localePart + this.pagePart + pageNumber).pipe(
            map(response => {
                console.log('incoming response:', response);
                return response['results'];
            }),
            catchError(this.handleError));
    }

    private handleError(error: Response | any) {
        if (error._body.type === 'error') {
            console.log(`%cRequest failed... Is json-server running?`, this.consoleTextColorService);
        }
        console.error(`%c_httpClient::handleError`, this.consoleTextColorService, error);
        return observableThrowError(error);
    }

    showDetails(movieId: number) {
        // console.log('%cdetails for : ', this.consoleTextColorService, movieId);

        this._httpClient.get(this.API_URLS[3] + movieId + '?api_key=' + this.api_key + this.localePart).pipe(
            map(response => {
                console.log('incoming response:', response);
                return response;
            })).subscribe((response) => {

                console.log('%cresponse: ', this.consoleTextColorService, response);

                // Call dialog 'Account'

                const dataForDialog = response;

                const dialogRef = this._dialog.open(DialogDetailsComponent, {
                    width: '731px',
                    data: dataForDialog
                });

                dialogRef.afterClosed().subscribe(result => {
                    // User clicked 'x' or clicked outside of the dialog
                });

                // this.movieList = [];

                // response.map(item => {
                //     const newMovie = new Movie(
                //         item['id'],
                //         item['title'],
                //         item['genre_ids'],
                //         item['backdrop_path'],
                //         item['poster_path'],
                //         item['popularity'],
                //         item['overview'],
                //         item['vote_average']
                //     );

                //     this.favoriteList.map(movie => {
                //         if (movie.id === newMovie.id) {
                //             newMovie.favorite = true;
                //         }
                //     });

                //     const genre_list = [];
                //     newMovie.genre_ids.map(id => {
                //         genre_list.push(this.genres[id]);
                //         // console.log(id + ' ' + this.genres[id]);
                //     });

                //     // console.log('genre_list: ' + genre_list);
                //     newMovie.genre_list = genre_list;

                //     this.movieList.push(newMovie);
                // });

                // console.log('%cmovieList: ', this.consoleTextColorService, this.movieList);
            });
    }

    searchMovie() {

        // console.log('%cselectedIndex: ', this.consoleTextColorService, this.selectedIndex);
        // this.selectedIndex = 1;

        if (!this.form.get('searchField').value) {
            return;
        }

        // tslint:disable-next-line:max-line-length
        this._httpClient.get(this.API_URLS[2] + this.api_key + this.localePart + '&query=' + this.form.get('searchField').value + '&page=1&include_adult=false').pipe(
            map(response => {
                console.log('incoming response:', response);
                return response['results'];
            })).subscribe((response) => {

                this.selectedIndex = 0;

                console.log('%cresponse: ', this.consoleTextColorService, response);

                this._movieStorageService.movieList = [];

                response.map(item => {
                    const newMovie = new Movie(
                        item['id'],
                        item['title'],
                        item['genre_ids'],
                        item['backdrop_path'],
                        item['poster_path'],
                        item['popularity'],
                        item['overview'],
                        item['vote_average']
                    );

                    this._favService.favoriteList.map(movie => {
                        if (movie.id === newMovie.id) {
                            newMovie.favorite = true;
                        }
                    });

                    const genre_list = [];
                    newMovie.genre_ids.map(id => {
                        genre_list.push(this.genres[id]);
                        // console.log(id + ' ' + this.genres[id]);
                    });

                    // console.log('genre_list: ' + genre_list);
                    newMovie.genre_list = genre_list;

                    this._movieStorageService.movieList.push(newMovie);
                });

                console.log('%cmovieList: ', this.consoleTextColorService, this._movieStorageService.movieList);
            });
    }

    setDefaultPage(state: boolean) {

        if (state) {
            this.getMovies();
        } else {
            this._movieStorageService.movieList = this._favService.favoriteList;
        }

    }

    logTabChange(event) {
        // console.log('%ctab changed! event: ', this.consoleTextColorService, event['index']);
        this.selectedIndex = event['index'];
    }

    addToFavorite(movie: Movie) {
        this._favService.addToFavorite(movie);
    }

}
