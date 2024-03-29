import { Component, OnInit, Inject } from '@angular/core';

// Models
import { Movie } from '@app/movie';

// Services
import { FavoritesService } from '@app/_services/favorites-service';
import { HttpService } from '@app/_services/http-service';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-dialog-details',
    templateUrl: './dialog-details.component.html',
    styleUrls: ['./dialog-details.component.scss']
})
export class DialogDetailsComponent implements OnInit {

    consoleTextColorComponent = 'color: cadetblue;';

    genres: string[] = [];
    recomendations: string[] = [];
    favColor = 'primary';
    favText = 'Add to favorite';
    isFavorite = true;

    constructor(
        public dialogRef: MatDialogRef<DialogDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public _favService: FavoritesService,
        private _httpService: HttpService
    ) { }

    ngOnInit() {
        this.data['genres'].map(val => {
            this.genres.push(val['name']);
        });

        this._favService.favoriteList.map(movie => {
            if (movie.id === this.data.id) {
                this.favColor = 'accent';
                this.favText = 'Remove from favorite';
            }
        });

        this._httpService.getRecomendations(this.data.id, 1).subscribe(response => {
            console.log('%cresponse in recom:', this.consoleTextColorComponent, response);
            response.slice(0, 5).map(val => {
                this.recomendations.push(val.title);
            });

            console.log('%crecomendations:', this.consoleTextColorComponent, this.recomendations);
        });
    }

    addToFavorite() {
        let isFav = false;
        this._favService.favoriteList.map(movie => {
            if (movie.id === this.data.id) {
                isFav = true;
            }
        });

        const newMovie = new Movie(
            this.data['id'],
            this.data['title'],
            this.data['genre_ids'],
            this.data['backdrop_path'],
            this.data['poster_path'],
            this.data['popularity'],
            this.data['overview'],
            this.data['vote_average']
        );
        newMovie.favorite = isFav;

        this._favService.addToFavorite(newMovie);
        if (isFav) {
            this.favColor = 'primary';
            this.favText = 'Add to favorite';
        } else {
            this.favColor = 'accent';
            this.favText = 'Remove from favorite';
        }
    }

}
