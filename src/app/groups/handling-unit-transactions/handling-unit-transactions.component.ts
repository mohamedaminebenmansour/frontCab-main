import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { StockMovement } from '../../models/stock-movement.model';
import { CommonModule } from '@angular/common'; // Updated: Added for *ngFor and date pipe

@Component({
  selector: 'app-handling-unit-transactions',
  templateUrl: './handling-unit-transactions.component.html',
  standalone: true,
  imports: [CommonModule], // Updated: Use CommonModule instead of DatePipe
})
export class HandlingUnitTransactionsComponent implements OnInit {
  handlingUnitId: number | null = null;
  transactions: StockMovement[] = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.handlingUnitId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.handlingUnitId) {
      this.apiService.getHandlingUnitTransactions(this.handlingUnitId).subscribe(data => {
        this.transactions = data;
      });
    }
  }
}