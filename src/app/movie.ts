export class Movie {
    id: number;
    title: string;
    genre_ids: number[];
    genre_list: string[];
    backdrop_path: string;
    poster_path: string;
    popularity: number;
    overview: string;
    vote_average: number;
    favorite: boolean;

    constructor(
        id: number,
        title: string,
        genre_ids: number[],
        backdrop_path: string,
        poster_path: string,
        popularity: number,
        overview: string,
        vote_average: number
    ) {
        this.id = id;
        this.title = title;
        this.genre_ids = genre_ids;
        this.backdrop_path = backdrop_path;
        this.poster_path = poster_path;
        this.popularity = popularity;
        this.overview = overview;
        this.vote_average = vote_average;
    }
}
