import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, delay, map, tap } from 'rxjs/operators';
import { Country, OlympicData } from '@core/models/olympic-data.types';
import ApiService from '../api-service/api-service.service'; // Assuming you have the correct import path
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * OlympicService provides methods for fetching Olympic data and managing related state.
 *
 * @extends ApiService
 */
@Injectable({
  providedIn: 'root',
})
export class OlympicService extends ApiService {
  private olympics$ = new BehaviorSubject<OlympicData>([]);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(httpClient: HttpClient) {
    super(httpClient); // Pass the HttpClient instance to the base class

    this.baseUrl = './assets/mock/olympic.json';
  }

  /**
   * Loads the initial Olympic data from the API.
   *
   * @returns {Observable<OlympicData>} An observable with the loaded Olympic data.
   */
  loadInitialData(): Observable<OlympicData> {
    this.isLoading$.next(true);

    const fetchedObservable: Observable<OlympicData> =
      this.fetchGet<OlympicData>({
        urlSegment: this.baseUrl,
      });

    return fetchedObservable.pipe(
      delay(1_500),
      tap((value) => {
        this.isLoading$.next(false);
        return this.olympics$.next(value);
      }),
      catchError((error: string, caught: Observable<OlympicData>): never => {
        this.isLoading$.next(false);
        this.olympics$.next([]);
        throw new Error(
          `An error occurred while loading Olympic data: ${caught}`
        );
      })
    );
  }

  /**
   * Gets the observable of Olympic data.
   *
   * @returns {Observable<OlympicData>} An observable of Olympic data.
   */
  getOlympics(): Observable<OlympicData> {
    return this.olympics$.asObservable();
  }

  /**
   * Gets an observable of a specific Olympic country by its ID.
   *
   * @param {number} id - The ID of the Olympic country.
   * @returns {Observable<Country | null | undefined>} An observable of the Olympic country.
   */
  getOlympicCountryById(id: number): Observable<Country | null | undefined> {
    return this.olympics$.pipe(
      map((olympics) =>
        olympics.find((country: Country) => {
          return country.id === id;
        })
      ),
      defaultIfEmpty(null)
    );
  }

  /**
   * Gets the observable of the loading state.
   *
   * @returns {Observable<boolean>} An observable indicating whether data is currently being loaded.
   */
  getIsLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }
}
