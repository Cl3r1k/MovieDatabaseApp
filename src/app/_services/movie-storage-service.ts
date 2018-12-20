import { Injectable } from '@angular/core';

// Models
import { Movie } from '@app/movie';

@Injectable({
    providedIn: 'root'
})
export class MovieStorageService {

    movieList: Movie[] = [];
    genres: Object = {};

    constructor() { }

}
