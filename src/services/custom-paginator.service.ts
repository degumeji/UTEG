import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from "rxjs";

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl
  implements OnDestroy {
  unsubscribe: Subject<void> = new Subject<void>();
  OF_LABEL = 'of';

  constructor(private translate: TranslateService) {
    super();

    this.translate.onLangChange
      .subscribe(() => {
        this.getAndInitTranslations();
      });

    this.getAndInitTranslations();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getAndInitTranslations() {
    this.translate
      .get([
        'paginator.items_per_page',
        'paginator.next_page',
        'paginator.previous_page',
        'paginator.first_page',
        'paginator.last_page',
        'paginator.of_label',
      ])
      .subscribe((translation: any) => {
        this.itemsPerPageLabel =
          translation['paginator.items_per_page'];
        this.nextPageLabel = translation['paginator.next_page'];
        this.previousPageLabel = translation['paginator.previous_page'];
        this.firstPageLabel = translation['paginator.first_page'];
        this.lastPageLabel = translation['paginator.last_page'];
        this.OF_LABEL = translation['paginator.of_label'];
        this.changes.next();
      });
  }

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number,
  ): string => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.OF_LABEL} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${
      this.OF_LABEL
    } ${length}`;
  };
}
