import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Booking {
  id: number;
  name: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookings: Booking[] = [];
  private nextId = 1;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return of(this.bookings); // Replace with an HTTP request if using a backend
  }

  book(booking: Booking): Observable<Booking> {
    booking.id = this.nextId++;
    this.bookings.push(booking);
    return of(booking); // Replace with an HTTP request if using a backend
  }
}
