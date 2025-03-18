import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { StorageService } from './storage.service';
import data from '../../assets/data/data.json';
import { Customer } from '../models/customer';
import { InvoiceItem } from '../models/invoice_item';
import { Invoice } from '../models/invoice';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private baseURL = "http://3.208.13.82:2078/akiproorders/downloadinvoices/2024-09-02/route1";
  private customerList: Customer[] = [];
  private invoiceItemList: InvoiceItem[] = [];
  private invoiceList: Invoice[] = [];

  constructor(private http: HttpClient, private storage: StorageService) {}

  //fetchData() {
  //  this.http.get(this.baseURL).subscribe({
  //    next: (data) => {
  //      const customers = (data as any).customer_details;
  //      if (customers) {
  //        customers.forEach((customer: any) => {
  //          console.log(customer.attributes.company);
  //        });
  //      }
  //    },
  //    error: (error) => console.log("Error: ", error)
  //  });
  //}

  async getData() {
    data.customer_details.forEach(element => {
      this.customerList.push({
        'id': element.attributes.custno, 
        'areaNo': element.attributes.areano,
        'lastInvoiceDate': element.attributes.lastinvoicedate,
        'company': element.attributes.company,
        'contact': element.attributes.contact ?? "",
        'email': element.attributes.emailaddress ?? "",
        'phone': element.attributes.phone,
        'terms': element.attributes.terms ?? "",
        'type': element.attributes.type,
        'addr1': element.attributes.addr1,
        'addr2': element.attributes.addr2 ?? ""
      });
    });

    data.invoice_items.forEach(invoiceItem => {
      this.invoiceItemList.push({
        'itemNo': invoiceItem.attributes.itemno,
        'numPerPack': invoiceItem.attributes.num_per_pack,
        'orderNo': invoiceItem.attributes.orderno,
        'packs': invoiceItem.attributes.packs,
        'partNo': invoiceItem.attributes.partno,
        'quantity': invoiceItem.attributes.qty,
        'returnsNo': invoiceItem.attributes.returnsno,
        'price': invoiceItem.attributes.storedprice,
        'vat': invoiceItem.attributes.vatamount,
        'vatRate': invoiceItem.attributes.vatrate,
        'discrepancies': invoiceItem.attributes.discrepencies,
        'discount': invoiceItem.attributes.discount,
        'creditNotes': invoiceItem.attributes.creditnotes
      });
    });

    data.invoice_master.forEach(invoice => {
      this.invoiceList.push({
        'invoiceNo': invoice.attributes.invoiceno,
        'orderNo': invoice.attributes.orderno,
        'custNo': invoice.attributes.custno,
        'routeNo': invoice.attributes.routeno,
        'standingDay': invoice.attributes.standing_day,
        'invoiceDate': invoice.attributes.invoicedate,
        'generate': invoice.attributes.generate,
        'generalNote': invoice.attributes.generalnote ?? "",
        'custDiscount': invoice.attributes.custdiscount,
        'taxRate': invoice.attributes.taxrate,
        'terms': invoice.attributes.terms ?? "",
        'totalDiscount': invoice.attributes.totaldiscount,
        'totalDiscount_adjdown': invoice.attributes.totaldiscount_adjdown,
        'totalDiscount_adjup': invoice.attributes.totaldiscount_adjup,
        'totalItems': invoice.attributes.totalitems,
        'totalItems_adjdown': invoice.attributes.totalitems_adjdown,
        'totalItems_adjup': invoice.attributes.totalitems_adjup,
        'totalVat': invoice.attributes.totalvat,
        'totalVat_adjdown': invoice.attributes.totalvat_adjdown,
        'totalVat_adjup': invoice.attributes.totalvat_adjup
      });
    });

    // Uncomment to store data in database (Should be when download button is made)
    // Only Store ONCE, because invoiceitems are not unique and will continue storing...

    //await this.storage.addCustomers(this.customerList);
    //await this.storage.addInvoices(this.invoiceList);
    //await this.storage.addInvoiceItems(this.invoiceItemList);

    //console.log(this.storage.customerList);
    //console.log(this.storage.invoiceList);
    //console.log(this.storage.invoiceItemList);
  }

}