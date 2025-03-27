import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {
  printerName: string = "default";
  printerStatus: string = 'default';
  wifiStatus: string = 'default';
  paymentTerminalName: string = "default";
  paymentTerminalStatus: string = "default";

  printStatus: boolean = false;
  paymentStatus: boolean = false;

  constructor(private navCtrl: NavController) {}

  goBack() {
    setTimeout(() => {
      this.navCtrl.back();
    }, 200)
  }

  togglePrinterOff() {
    this.printStatus = false;
  }

  togglePrinterOn() {
    this.printStatus = true;
  }

  togglePaymentOff() {
    this.paymentStatus = false;
  }

  togglePaymentOn() {
    this.paymentStatus = true;
  }

  ngOnInit() {
  }

}
