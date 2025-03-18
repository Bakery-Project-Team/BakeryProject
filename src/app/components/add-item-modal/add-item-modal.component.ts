import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';  // ✅ Import FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class AddItemModalComponent {
  @Input() productList!: any[]; // Receive product list from parent
  selectedProduct: any;
  quantity: number = 1;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  addItem() {
    if (!this.selectedProduct || this.quantity <= 0) {
      console.error("Invalid input");
      return;
    }
    this.modalCtrl.dismiss({
      product: this.selectedProduct,
      quantity: this.quantity
    });
  }
}
