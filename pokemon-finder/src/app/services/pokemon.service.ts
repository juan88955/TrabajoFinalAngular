import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

    constructor(private http: HttpClient) { }

    getPokemon(searchTerm: string | number): Observable<Pokemon> {
        const term = searchTerm.toString().toLowerCase();
        return this.http.get<Pokemon>(`${this.apiUrl}/${term}`);
    }
}