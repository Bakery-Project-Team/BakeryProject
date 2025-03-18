import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StorageService } from '../services/storage.service';
import { Invoice } from '../models/invoice';
import { InvoicedetailsComponent } from '../components/invoicedetails/invoicedetails.component';
import { FormsModule } from '@angular/forms';  // ✅ Import FormsModule
import { ModalController } from '@ionic/angular'
import { InvoiceItem } from '../models/invoice_item';


 @Component({
 selector: 'app-home',
 templateUrl: 'home.page.html',
 styleUrls: ['home.page.scss'],
 standalone: true,
 imports: [IonicModule, CommonModule, FormsModule],
 })

 export class HomePage implements OnInit {
    isDropdownHidden = true;
    invoices: any[] = []; // Stores all invoices
    filteredInvoices: any[] = []; // Stores filtered invoices
    searchQuery: string = ''; // Stores the search input
    deliveredCount: number = 0;   // ✅ Count of delivered invoices
    undeliveredCount: number = 0; // ✅ Count of undelivered invoices
    returnsCount: number = 0;

 constructor(private storage: StorageService, private modalCtrl: ModalController) {}

 async ngOnInit() {
    this.invoices = await this.storage.getInvoices();
    this.filteredInvoices = [...this.invoices]; // Copy invoices for filtering
    this.updateInvoiceSummary(); // ✅ Update counts on load

 }

 updateInvoiceSummary() {
    this.deliveredCount = this.invoices.filter(inv => inv.generate === 'Y').length;
    this.undeliveredCount = this.invoices.filter(inv => inv.generate !== 'Y').length;
    this.returnsCount = this.invoices.reduce((total, inv) => total + (inv.returnsNo || 0), 0);
  }

 filterInvoices(event: any) {
    console.log("Search")
    const query = event.target.value.toLowerCase();

    this.filteredInvoices = this.invoices.filter(invoice => 
      invoice.company.toLowerCase().includes(query) || // Search by company name
      invoice.invoiceNo.toString().includes(query) || // Search by invoice number
      invoice.invoiceDate.includes(query) // Search by date
    );

    this.updateInvoiceSummary(); // ✅ Update counts after filtering

  }

 async openInvoiceDetails(invoice: Invoice) {
    const items = await this.storage.getInvoiceItems(invoice.orderNo)
    const modal = await this.modalCtrl.create({
      component: InvoicedetailsComponent,
      componentProps: { invoice, items }, // Pass invoice data to modal
    });
    return await modal.present();
}

 toggleDropDown() {
    this.isDropdownHidden = !this.isDropdownHidden;
 }
}