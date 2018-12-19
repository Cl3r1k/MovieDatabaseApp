import { Injectable } from '@angular/core';

// Models
import { Movie } from '@app/movie';

// Services
import { MovieStorageService } from '@app/_services/movie-storage-service';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {

    favoriteList: Movie[] = [];

    constructor(private _movieStorageService: MovieStorageService) { }

    addToFavorite(movie: Movie) {
        let found = false;

        this.favoriteList.map(item => {
            if (item.id === movie.id) {
                found = true;
            }
        });

        if (found) {
            movie.favorite = false;
            this.favoriteList = this.favoriteList.filter((val) => val.id !== movie.id);
        } else {
            movie.favorite = true;
            this.favoriteList.push(movie);
        }

        this._movieStorageService.movieList.map(item => {
            if (item.id === movie.id && item.favorite !== movie.favorite) {
                item.favorite = movie.favorite;
            }
        });

        this.saveFavoriteList(this.favoriteList);
    }

    saveFavoriteList(favoriteList: Movie[]) {
        localStorage.setItem('_favoriteList', JSON.stringify(favoriteList));
    }

    loadFavoriteList(): Movie[] {
        const data = JSON.parse(localStorage.getItem('_favoriteList'));

        let favoriteList: Movie[] = [];
        if (data) {
            favoriteList = data;
        }

        // console.log('%cfavoriteList from LS: ', this.consoleTextColorService, favoriteList);

        return favoriteList;
    }
}
