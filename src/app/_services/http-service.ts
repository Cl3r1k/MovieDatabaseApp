import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Models
import { Movie } from '@app/movie';

// Services
import { MovieStorageService } from '@app/_services/movie-storage-service';
import { FavoritesService } from '@app/_services/favorites-service';

// Imports
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    consoleTextColorService = 'color: salmon;';

    public API_URLS = [
        'https://api.themoviedb.org/3/movie/popular',
        'https://api.themoviedb.org/3/genre/movie/list',
        'https://api.themoviedb.org/3/search/movie',
        'https://api.themoviedb.org/3/movie/',
        'https://api.themoviedb.org/3/movie/'
    ];
    public api_key = 'bb89d1ca9039938e89d75ef50cbd137d';
    public apiPart = '?api_key=';
    public localePart = '&language=en-US';
    public pagePart = '&page=';
    public totalPages = 100;

    constructor(
        private _httpClient: HttpClient,
        private _movieStorageService: MovieStorageService,
        private _favService: FavoritesService
    ) { }

    getGeneres() {
        return this._httpClient.get(this.API_URLS[1] + this.apiPart + this.api_key + this.localePart).pipe(
            map(response => {
                return response['genres'];
            }));
    }

    getMovies(mode: number, pageNumber: number, valueToSearch: string): Observable<Movie[]> {
        // console.log('%cCall API!', this.consoleTextColorService);

        let url = '';
        if (mode === 0) {
            url = this.API_URLS[0] + this.apiPart + this.api_key + this.localePart + this.pagePart + pageNumber;
        } else {
            // tslint:disable-next-line:max-line-length
            url = this.API_URLS[2] + this.apiPart + this.api_key + this.localePart + '&query=' + valueToSearch + this.pagePart + pageNumber + '&include_adult=false';
        }

        return this._httpClient.get(url).pipe(
            map(response => {

                console.log('%cin getMovies() response:', this.consoleTextColorService, response);

                this.totalPages = response['total_pages'] * 20;

                const movieList: Movie[] = [];
                response['results'].map(item => {
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
                        genre_list.push(this._movieStorageService.genres[id]);
                    });

                    newMovie.genre_list = genre_list;
                    movieList.push(newMovie);
                });

                return movieList;
            })
        );
    }

    getRecomendations(movieId: number, pageNumber: number): Observable<Movie[]> {
        // tslint:disable-next-line:max-line-length
        const url = this.API_URLS[3] + movieId + '/recommendations' + this.apiPart + this.api_key + this.localePart + this.pagePart + pageNumber;

        return this._httpClient.get(url).pipe(
            map(response => {

                console.log('%cresponse: ', this.consoleTextColorService, response);

                const movieList: Movie[] = [];

                response['results'].map(item => {
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

                    movieList.push(newMovie);
                });

                return movieList;
            }));
    }

    getDetails(movieId: number) {
        // console.log('%cdetails for : ', this.consoleTextColorService, movieId);

        return this._httpClient.get(this.API_URLS[3] + movieId + this.apiPart + this.api_key + this.localePart).pipe(
            map(response => {
                return response;
            }));
    }
}
