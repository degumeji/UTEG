import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LinkCardService} from './link-card.service';
import {catchError, switchMap, finalize} from 'rxjs/operators';
import {EMPTY, of} from 'rxjs';

interface UserI {
  id: number;
  email: string;
}

interface CardI {
  id: string;
  number: string;
}

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent implements OnInit {
  phoneNumberPattern = /^\d{10}$/;
  cardNumber = new FormControl('', [
    Validators.required,
    Validators.pattern(this.phoneNumberPattern)]);
  isLoading = false;
  user: UserI = { id: 0, email: '' };
  card: CardI = { id: '', number: '' };

  constructor(private _linkCardService: LinkCardService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.getUser().subscribe();
  }

  testCall1() {
    this._linkCardService.call1Method()
      .subscribe({
        next: (response: any) => {
          if (response) {
            console.log(response);
          }
        },
        error: (error) => {
        }
      })
  }

  onAddCard(): void {
    if (this.cardNumber.invalid) {
      this.getErrorMessage();
      return;
    }
    this.executeSequence();
  }

  executeSequence(): void {
    this.isLoading = true; // Set loading state to true at the beginning

    this.addCard()
      .pipe(
        switchMap((cardData: any) => cardData.number ? this.getCard(cardData.number) : EMPTY),
        switchMap((card: CardI) => this.deleteCard(card.id)),
        catchError((error: any) => {
          this.showError(error);
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false; // Reset loading state to false when complete or error
        })
      )
      .subscribe(
        () => {
          this.cardNumber.reset();
          this._snackBar.open(`We just transferred the points from your old account! Enjoy.`, undefined, {
            duration: 6000,
            panelClass: 'custom-snackbar'
          })
        },
        (error: any) => console.error(`Sequence failed: ${ error }`)
      );
  }


  getUser() {
    return this._linkCardService.getUser().pipe(
      catchError(error => {
        this.showError(error);
        return EMPTY;
      }),
      switchMap((response: any) => {
        this.user.id = response.user?.id || 0;
        this.user.email = response.user?.email_address || '';
        return of(this.user);
      })
    );
  }

  addCard() {
    if (this.cardNumber.invalid) {
      this.getErrorMessage();
      return EMPTY;
    }

    const cardData = {
      user: this.user.id,
      number: this.cardNumber.value,
      pin: '000'
    };

    return this._linkCardService.linkCard(cardData).pipe(
      catchError(error => {
        this.showError(error);
        return EMPTY;
      }),
      switchMap((response: any) => {
        return of(cardData);
      })
    );
  }

  getCard(cardNumber: string) {
    return this._linkCardService.getCard().pipe(
      catchError(error => {
        this.showError(error);
        return EMPTY;
      }),
      switchMap((response: any) => {
        const card = response.data.find((c: any) => c.card.number === cardNumber);
        if (card) {
          this.card = { id: card.id, number: card.card.number };
        }
        return of(this.card);
      })
    );
  }

  deleteCard(cardId: string) {
    return this._linkCardService.deleteCard(cardId).pipe(
      catchError(error => {
        this.showError(error);
        return EMPTY;
      }),
      switchMap((response: any) => {
        this._snackBar.open(`All balances on this account has been successfully transferred to ${ this.user.email }.`);
        return of(response);
      })
    );
  }

  showError(error: any): void {
    const errorStatus = error.status;
    let message = error?.error?.error?.errors[0]?.message || 'M Hospitality! Something went wrong';
    if (errorStatus === 404) {
      message = 'M Hospitality! Something went wrong. It seems like there’s no account linked to your phone number. Please try again and if the issue continues, contact us at help@uteg.com.'
    }
    this._snackBar.open(message, undefined, {
      duration: 5000,
      panelClass: 'custom-snackbar-error'
    });
  }

  getErrorMessage(): string {
    if (this.cardNumber.hasError('required')) {
      return 'You must enter a value';
    }
    return this.cardNumber.hasError('pattern') ? 'Not a valid phone number' : '';
  }
}
