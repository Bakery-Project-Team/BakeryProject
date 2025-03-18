import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';  // ✅ Import FormsModule
import { CommonModule } from '@angular/common';
import { AddItemModalComponent } from '../add-item-modal/add-item-modal.component';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-return-discrepancy-modal',
  templateUrl: './return-discrepancy-modal.component.html',
  styleUrls: ['./return-discrepancy-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReturnDiscrepancyModalComponent {
  @Input() invoice!: any; // Receiving invoice details
  items: any[] = [];
  selectedType: string = "return"; // Default type

  constructor(private modalCtrl: ModalController, private storage: StorageService) {}

  close() {
    this.modalCtrl.dismiss();
  }

  async addItem() {
    this.items = await this.storage.getInvoiceItems(this.invoice.orderNo)
    const modal = await this.modalCtrl.create({
      component: AddItemModalComponent,
      componentProps: { productList: this.items }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.items.push(data.data);
      }
    });
  
    return await modal.present();
  }

  postChange() {
    console.log("Posting Change:", this.selectedType, this.items);
    this.modalCtrl.dismiss();
  }
}
