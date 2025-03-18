import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Invoice } from 'src/app/models/invoice';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReturnDiscrepancyModalComponent } from '../return-discrepancy-modal/return-discrepancy-modal.component';


@Component({
  selector: 'app-invoicedetails',
  templateUrl: './invoicedetails.component.html',
  styleUrls: ['./invoicedetails.component.scss'],
  standalone: true,
   imports: [IonicModule, CommonModule],
})
export class InvoicedetailsComponent {
  @Input() invoice!: any;
  @Input() items!: any;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  confirmDelivery() {
    console.log("Delivery confirmed for Invoice:", this.invoice.invoiceNo);
    this.modalCtrl.dismiss(); // Close modal after confirmation
  }

  async handleReturnOrDiscrepancy() {
    const modal = await this.modalCtrl.create({
      component: ReturnDiscrepancyModalComponent,
      componentProps: { invoice: this.invoice }
    });
    return await modal.present();
  }
}
