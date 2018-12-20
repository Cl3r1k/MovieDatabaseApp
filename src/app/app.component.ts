import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';

// Models
import { Movie } from './movie';

// Components
import { DialogDetailsComponent } from '@app/dialogs/dialog-details/dialog-details.component';

// Services
import { HttpService } from '@app/_services/http-service';
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

    pageNumber = 1;
    public form: FormGroup;
    selectedIndex = 0;

    pageSize = 20;
    pageSizeOptions: number[] = [20];

    constructor(
        private _httpClient: HttpClient,
        private _httpService: HttpService,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog,
        private _movieStorageService: MovieStorageService,
        private _favService: FavoritesService) {
        this.form = _formBuilder.group({
            searchField: ['']
        });

        this._favService.favoriteList = this._favService.loadFavoriteList();

        this.form.valueChanges.pipe(
            debounceTime(700),
            distinctUntilChanged(),
        ).subscribe(value => {
            this.searchMovie();
        });
    }

    ngOnInit() {

        const url = this._httpService.API_URLS[1] + this._httpService.apiPart + this._httpService.api_key + this._httpService.localePart;
        this._httpClient.get(url).pipe(
            map(response => {
                return response['genres'];
            })).subscribe((response) => {

                response.map(value => {
                    this._movieStorageService.genres[value['id']] = value['name'];
                });

                this._httpService.getMovies(0, this.pageNumber, '').subscribe(res => {
                    this._movieStorageService.movieList = res;
                });
            });
    }

    private handleError(error: Response | any) {
        if (error._body.type === 'error') {
            console.log(`%cRequest failed... Is json-server running?`, this.consoleTextColorService);
        }
        console.error(`%c_httpClient::handleError`, this.consoleTextColorService, error);
        return observableThrowError(error);
    }

    showDetails(movieId: number) {
        console.log('%cdetails for : ', this.consoleTextColorService, movieId);

        this._httpService.getDetails(movieId).subscribe(res => {
            // Call dialog 'Account'
            const dataForDialog = res;

            const dialogRef = this._dialog.open(DialogDetailsComponent, {
                width: '731px',
                data: dataForDialog
            });

            dialogRef.afterClosed().subscribe(result => {
                // User clicked 'x' or clicked outside of the dialog
            });
        });
    }

    searchMovie() {
        if (!this.form.get('searchField').value) {
            return;
        }

        // Reset current tab
        this.selectedIndex = 0;

        this._httpService.getMovies(1, this.pageNumber, this.form.get('searchField').value).subscribe(res => {
            this._movieStorageService.movieList = res;
        });
    }

    logTabChange(event) {
        this.selectedIndex = event['index'];
    }

    addToFavorite(movie: Movie) {
        this._favService.addToFavorite(movie);
    }

    pageChange(event) {
        // console.log(event.pageIndex);

        this.pageNumber = event.pageIndex + 1;
        this._httpService.getMovies(0, this.pageNumber, '').subscribe(res => {
            this._movieStorageService.movieList = res;
        });
    }

}
