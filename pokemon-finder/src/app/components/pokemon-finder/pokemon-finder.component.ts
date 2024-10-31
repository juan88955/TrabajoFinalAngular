import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';

import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-finder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    MessagesModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div class="max-w-md mx-auto">
        <p-card class="bg-gray-800 shadow-xl">
          <h1 class="text-3xl font-bold text-center mb-4 text-purple-400">Pokémon Finder</h1>
          
          <!-- Búsqueda -->
          <div class="mb-4 flex gap-2">
            <input 
              type="text" 
              pInputText 
              placeholder="Buscar Pokémon..." 
              class="w-full bg-gray-700 text-white border-gray-600 placeholder-gray-400"
              #searchInput
              [disabled]="loading()"
            >
            <p-button 
              label="Buscar" 
              (onClick)="search(searchInput.value)"
              [loading]="loading()"
              styleClass="p-button-outlined p-button-secondary"
            ></p-button>
          </div>

          <!-- Error Message -->
          <p class="text-red-400 text-center" *ngIf="error()">
            {{ error() }}
          </p>

          <!-- Pokemon Display -->
          <div *ngIf="pokemon() && !error()" class="text-center">
            <h2 class="text-2xl font-bold capitalize mb-2 text-white">{{ pokemon()?.name }}</h2>
            
            <!-- Pokemon Image -->
            <div class="relative w-48 h-48 mx-auto bg-gradient-to-r from-gray-700 to-gray-800 rounded-full p-2 shadow-lg mb-4">
              <img 
                [src]="currentSprite()"
                alt="Pokemon sprite"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Pokemon Types -->
            <div class="flex gap-2 justify-center mt-4">
              <span 
                *ngFor="let type of pokemon()?.types || []"
                class="px-4 py-1 rounded-full text-white text-sm font-medium shadow-lg transition-transform hover:scale-105"
                [ngClass]="{
                  'bg-gradient-to-r from-red-600 to-red-500': type.type.name === 'fire',
                  'bg-gradient-to-r from-blue-600 to-blue-500': type.type.name === 'water',
                  'bg-gradient-to-r from-green-600 to-green-500': type.type.name === 'grass',
                  'bg-gradient-to-r from-yellow-500 to-yellow-400': type.type.name === 'electric',
                  'bg-gradient-to-r from-purple-600 to-purple-500': type.type.name === 'poison',
                  'bg-gradient-to-r from-gray-600 to-gray-500': type.type.name === 'normal'
                }"
              >
                {{ type.type.name }}
              </span>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep {
      .p-card {
        background-color: #1f2937;
        border-radius: 1rem;
      }

      .p-card .p-card-content {
        padding: 1.5rem;
      }

      .p-inputtext {
        border-radius: 0.5rem;
      }

      .p-button {
        border-radius: 0.5rem;
      }
    }
  `],
  providers: [PokemonService]
})
export class PokemonFinderComponent implements OnDestroy {
  pokemon = signal<Pokemon | null>(null);
  loading = signal<boolean>(false);
  currentSprite = signal<string>('');
  error = signal<string>('');
  spriteInterval: number | undefined;

  constructor(private pokemonService: PokemonService) { }

  search(term: string) {
    if (!term.trim()) return;

    this.loading.set(true);
    this.error.set('');
    this.stopSpriteAnimation();

    this.pokemonService.getPokemon(term).subscribe({
      next: (data) => {
        this.pokemon.set(data);
        this.startSpriteAnimation();
        this.playPokemonSound();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Pokémon no encontrado');
        this.pokemon.set(null);
        this.loading.set(false);
      }
    });
  }

  startSpriteAnimation() {
    if (!this.pokemon()) return;

    let isFront = true;
    this.currentSprite.set(this.pokemon()!.sprites.front_default);

    this.spriteInterval = window.setInterval(() => {
      const pokemon = this.pokemon();
      if (!pokemon) return;

      this.currentSprite.set(
        isFront ?
          pokemon.sprites.front_default :
          pokemon.sprites.back_default
      );
      isFront = !isFront;
    }, 1000);
  }

  stopSpriteAnimation() {
    if (this.spriteInterval) {
      window.clearInterval(this.spriteInterval);
    }
  }

  playPokemonSound() {
    const id = this.pokemon()?.id;
    if (!id) return;

    const soundUrl = `https://pokemoncries.com/cries/${id}.mp3`;
    const audio = new Audio(soundUrl);
    audio.play().catch(e => console.log('Error reproduciendo sonido:', e));
  }

  ngOnDestroy() {
    this.stopSpriteAnimation();
  }
}