import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { TransactionService } from 'src/services/transactions.service';
import { Paginator } from "../../interfaces/app";
import { PageEvent } from "@angular/material/paginator";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {

  public transactions: any;
  public validTransactions = 0;
  public isEmpty = false;
  public pageSizeOptions = [5, 10, 25];
  public disabledPaginator = false;

  paginator: Paginator = {
    page: 0,
    limit: 5,
    total: 0
  }

  constructor(private router: Router,
              private transactionService : TransactionService,
              private translate : TranslateService){}

  ngOnInit(): void {
    this.getTransaction();
  }

  changeValidTransactionsData() {
    let currentValidTransactions = 0;
    for (let item of (this.transactions || [])) {
      const isQuickpayUsed = item.quickpay.used > 0;
      const isQuickpayLoaded = item.quickpay.loaded > 0;
      const isQuickpayData = item.rewards.length > 0 || item.items.length > 0;
      if (isQuickpayUsed || isQuickpayLoaded || isQuickpayData) {
        currentValidTransactions += 1;
      }
    }
    this.validTransactions = currentValidTransactions;
  }

  getTransaction(){
    const paginatorRequest: Paginator = {
      page: this.paginator.page + 1,
      limit: this.paginator.limit
    };
    this.disabledPaginator = true;
    this.isEmpty = false;
    this.transactionService.getTransactions(paginatorRequest)
    .subscribe({
      next: (response:any) => {
        this.paginator.total = response.count;
        if (response.count > 0) {
          this.transactions = response.data;
          for (let transaction of this.transactions) {
            transaction.total = Math.trunc(transaction.total);
            transaction.date = this.getFormatDate(transaction.date)
            for (let item of transaction.items) {
              item.price = Math.trunc(item.price);
            }
            //Calcular monedas ganadas exclusivo para farmacias MIA
            for (let reward of transaction.rewards) {
              reward.earned = Math.trunc(reward.earned - reward.spent);
            }

            for (let receipt of transaction.receipts) {
              receipt.subtotal = Math.trunc(receipt.subtotal);
            }
          }
          this.changeValidTransactionsData();
        } else {
          this.isEmpty = true;
        }
      },
      error: (error) => {
        console.log("message-error", error.status);
      },
      complete: () => {
        this.disabledPaginator = false;
      }
    });
  }

  handlePageEvent(event: PageEvent) {
    this.paginator.limit = event.pageSize;
    this.paginator.page = event.pageIndex;
    this.getTransaction();
  }

  getFormatDate(timestampdate:any) : string {
    if(timestampdate!=undefined){
      let d = new Date(timestampdate * 1000);
      let timehours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours();
      let timeminutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
      timeminutes = (d.getHours() < 12) ? timeminutes + " AM":  timeminutes + " PM";
      return this.getMonthText(d.getMonth()) + " " + d.getDate() + ", " + timehours + ":" + timeminutes;
    }
    return "";
  }

  getMonthText(d:any){
    var month = new Array();
    month[0] = this.translate.instant("months.month_1");
    month[1] = this.translate.instant("months.month_2");
    month[2] = this.translate.instant("months.month_3");
    month[3] = this.translate.instant("months.month_4");
    month[4] = this.translate.instant("months.month_5");
    month[5] = this.translate.instant("months.month_6");
    month[6] = this.translate.instant("months.month_7");
    month[7] = this.translate.instant("months.month_8");
    month[8] = this.translate.instant("months.month_9");
    month[9] = this.translate.instant("months.month_10");
    month[10] = this.translate.instant("months.month_11");
    month[11] = this.translate.instant("months.month_12");
    var mes = month[d];
    return mes;
  }

  fixedWithoutRound(number : number){
    var num : string = number.toString();
    if(num.includes(".")){
      num = num.slice(0, (num.indexOf("."))+3);
      if(num.toString().length==3){
        num = num + "0";
      }
      if(num.charAt(0)=="-"){
        if(num.toString().length==4){
          num = num + "0";
        }
      }
    }else{
      num = num + ".00";
    }
    return num;
  }
}
