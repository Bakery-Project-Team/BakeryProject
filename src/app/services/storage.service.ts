import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { DbnameVersionService } from './dbname-version.service';
import { UserUpgradeStatements } from '../upgrades/user.upgrade.statements';
import { Customer } from '../models/customer';
import { InvoiceItem } from '../models/invoice_item';
import { Invoice } from '../models/invoice';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataService } from './data.service';
import { Toast } from '@capacitor/toast';

@Injectable()
export class StorageService {
    public customerList: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([]);
    public invoiceItemList: BehaviorSubject<InvoiceItem[]> = new BehaviorSubject<InvoiceItem[]>([]);
    public invoiceList: BehaviorSubject<Invoice[]> = new BehaviorSubject<Invoice[]>([]);
    private databaseName: string = "";
    private uUpdStmts: UserUpgradeStatements = new UserUpgradeStatements();
    private versionUpgrades;
    private loadToVersion;
    private db!: SQLiteDBConnection;
    private isDatabaseReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(private sqliteService: SQLiteService, private dbVerService: DbnameVersionService) {
        this.versionUpgrades = this.uUpdStmts.userUpgrades;
        this.loadToVersion = this.versionUpgrades[this.versionUpgrades.length - 1].toVersion;
    }

    async initializeDatabase(dbName: string) {
        this.databaseName = dbName;
        await this.sqliteService.addUpgradeStatement({ database: this.databaseName, upgrade: this.versionUpgrades });
        this.db = await this.sqliteService.openDatabase(this.databaseName, false, 'no-encryption', this.loadToVersion, false);
        this.dbVerService.set(this.databaseName, this.loadToVersion);
        await this.loadAllData();
    }

    databaseState() {
        return this.isDatabaseReady.asObservable();
    }

    fetchCustomers(): Observable<Customer[]> {
        return this.customerList.asObservable();
    }

    fetchProducts(): Observable<InvoiceItem[]> {
        return this.invoiceItemList.asObservable();
    }

    fetchInvoices(): Observable<Invoice[]> {
        return this.invoiceList.asObservable();
    }

    async loadCustomers() {
        const customers: Customer[] = (await this.db.query('SELECT * FROM customers;')).values as Customer[];
        this.customerList.next(customers);
    }

    async loadInvoiceItems() {
        const products: InvoiceItem[] = (await this.db.query('SELECT * FROM invoiceitems')).values as InvoiceItem[];
        this.invoiceItemList.next(products);
    }

    async loadInvoices() {
        const invoices: Invoice[] = (await this.db.query('SELECT * FROM invoices')).values as Invoice[];
        this.invoiceList.next(invoices);
    }

    async loadAllData() {
        await Promise.all([this.loadCustomers(), this.loadInvoiceItems(), this.loadInvoices()]);
        this.isDatabaseReady.next(true);
    }

    // Adds a single customer
    async addCustomer(customer: Customer) {
        const sql = `INSERT INTO customers (id, areaNo, lastInvoiceDate, company, contact, email, phone, terms, type, addr1, addr2)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.run(sql, [
            customer.id,
            customer.areaNo ?? 0,
            customer.lastInvoiceDate,
            customer.company,
            customer.contact || null,
            customer.email || null,
            customer.phone,
            customer.terms,
            customer.type,
            customer.addr1,
            customer.addr2 || null
        ]);
        await this.loadCustomers();
    }

    // Adds a list of customers
    async addCustomers(customers: Customer[]) {
        const sql = `INSERT INTO customers (id, areaNo, lastInvoiceDate, company, contact, email, phone, terms, type, addr1, addr2)
        VALUES `;

        var values = customers.map(customer => `(${customer.id}, ${customer.areaNo}, '${customer.lastInvoiceDate.replace(/'/g, "''")}', '${customer.company.replace(/'/g, "''")}', '${customer.contact.replace(/'/g, "''")}', '${customer.email.replace(/'/g, "''")}', '${customer.phone.replace(/'/g, "''")}', '${customer.terms.replace(/'/g, "''")}', '${customer.type.replace(/'/g, "''")}', '${customer.addr1.replace(/'/g, "''")}', '${customer.addr2.replace(/'/g, "''")}')`).join(",\n");
        values += ';';

        await this.db.execute(sql + values);
        await this.loadCustomers();
    }

    // Adds a single invoice item
    async addInvoiceItem(item: InvoiceItem) {
        const sql = `INSERT INTO invoiceitems (itemNo, numPerPack, orderNo, packs, partNo, quantity, returnsNo, price, vat, vatRate, discrepancies, discount, creditNotes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.run(sql, [
            item.itemNo,
            item.numPerPack,
            item.orderNo,
            item.packs,
            item.partNo,
            item.quantity,
            item.returnsNo,
            item.price,
            item.price,
            item.vat,
            item.vatRate,
            item.discrepancies,
            item.discount,
            item.creditNotes
        ]);
        await this.loadInvoiceItems();
    }

    // Adds a list of invoice items
    async addInvoiceItems(items: InvoiceItem[]) {
        const sql = `INSERT INTO invoiceitems (itemNo, numPerPack, orderNo, packs, partNo, quantity, returnsNo, price, vat, vatRate, discrepancies, discount, creditNotes)
        VALUES `;

        var values = items.map(item => `(${item.itemNo}, ${item.numPerPack}, ${item.orderNo}, ${item.packs}, '${item.partNo.replace(/'/g, "''")}', ${item.quantity}, ${item.returnsNo}, ${item.price}, ${item.vat}, ${item.vatRate}, ${item.discrepancies}, ${item.discount}, ${item.creditNotes})`).join(",\n");
        values += ';';

        await this.db.execute(sql + values);
        await this.loadInvoiceItems();
    }

    // Adds a single invoice
    async addInvoice(invoice: Invoice) {
        const sql = `INSERT INTO invoices (invoiceNo, orderNo, custNo, routeNo, standingDay, invoiceDate, generate, generalNote, custDiscount, taxRate, terms,
                    totalDiscount, totalDiscount_adjdown, totalDiscount_adjup, totalItems, totalItems_adjdown, totalItems_adjup, totalVat, totalVat_adjdown, totalVat_adjup)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await this.db.run(sql, [
            invoice.invoiceNo,
            invoice.orderNo,
            invoice.custNo,
            invoice.routeNo,
            invoice.standingDay,
            invoice.invoiceDate,
            invoice.generate,
            invoice.generalNote || null,
            invoice.custDiscount,
            invoice.taxRate,
            invoice.terms || null,
            invoice.totalDiscount,
            invoice.totalDiscount_adjdown,
            invoice.totalDiscount_adjup,
            invoice.totalItems,
            invoice.totalItems_adjdown,
            invoice.totalItems_adjup,
            invoice.totalVat,
            invoice.totalVat_adjdown,
            invoice.totalVat_adjup
        ]);
        await this.loadAllData();
    }

    // Adds a list of invoices
    async addInvoices(invoices: Invoice[]) {
        const sql = `INSERT INTO invoices (invoiceNo, orderNo, custNo, routeNo, standingDay, invoiceDate, generate, generalNote, custDiscount, taxRate, terms,
        totalDiscount, totalDiscount_adjdown, totalDiscount_adjup, totalItems, totalItems_adjdown, totalItems_adjup, totalVat, totalVat_adjdown, totalVat_adjup)
        VALUES `;

        var values = invoices.map(invoice => `(${invoice.invoiceNo}, ${invoice.orderNo}, ${invoice.custNo}, '${invoice.routeNo.replace(/'/g, "''")}', '${invoice.standingDay.replace(/'/g, "''")}', '${invoice.invoiceDate.replace(/'/g, "''")}', '${invoice.generate.replace(/'/g, "''")}', '${invoice.generalNote.replace(/'/g, "''")}', ${invoice.custDiscount}, ${invoice.taxRate}, '${invoice.terms.replace(/'/g, "''")}', ${invoice.totalDiscount}, ${invoice.totalDiscount_adjdown}, ${invoice.totalDiscount_adjup}, ${invoice.totalItems}, ${invoice.totalItems_adjdown}, ${invoice.totalItems_adjup}, ${invoice.totalVat}, ${invoice.totalVat_adjdown}, ${invoice.totalVat_adjup})`).join(",\n");
        values += ';';

        await this.db.execute(sql + values);
        await this.loadInvoices();
    }

    // Queries

    // Gets all items on an invoice by order number
    async getInvoiceItems(orderNo: number) {
        try {
            const result: InvoiceItem[] = (await this.db.query('SELECT * FROM invoiceitems WHERE orderNo = ?', [orderNo])).values as InvoiceItem[];
            if (result.length > 0) {
                return result;
            } else {
                return [];
            }
        } catch (erorr) {
            console.log("Error");
            return [];
        }
    }

    // Get invoice item by orderNo and itemNo
    async getSingleInvoiceItem(itemNo: number, orderNo: number) {
        try {
            const result: InvoiceItem[] = (await this.db.query('SELECT * FROM invoiceitems WHERE itemNo = ? AND orderNo = ?', [itemNo, orderNo,])).values as InvoiceItem[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying invoiceitem by itemNo and orderNo ...", error);
            return -999;
        }
    }

    // Gets a customer by customer ID
    async getCustomer(custNo: number) {
        try {
            const result: Customer[] = (await this.db.query('SELECT * FROM customers WHERE id = ?', [custNo])).values as Customer[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying customer ...", error);
            return -999;
        }
    }

    // Gets a customer by invoice number
    async getCustomerbyInvoice(invoiceNo: number) {
        try {
            const result: Customer[] = (await this.db.query('SELECT c.* FROM customers c JOIN invoices i ON c.id = i.custNo WHERE i.invoiceNo = ?', [invoiceNo])).values as Customer[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying customer by invoice ...", error);
            return -999;
        }
    }

    // Gets invoices by invoice number
    async getInvoice(invoiceNo: number) {
        try {
            const result: Invoice[] = (await this.db.query('SELECT * FROM invoices WHERE invoiceNo = ?', [invoiceNo])).values as Invoice[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying invoice ...", error);
            return -999;
        }
    }

    // Gets invoice by order number
    async getInvoicebyOrderNo(orderNo: number) {
        try {
            const result: Invoice[] = (await this.db.query('SELECT * FROM invoices where orderNo = ?', [orderNo])).values as Invoice[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying invoice ...", error);
            return -999;
        }
    }

    // Gets invoice by customer ID
    async getInvoicesbyCustNo(custNo: number) {
        try {
            const result: Invoice[] = (await this.db.query('SELECT * FROM invoices WHERE custNo = ?', [custNo])).values as Invoice[];
            if (result.length > 0) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error querying invoice by custNo ...", error);
            return -999;
        }
    }

    // Log Return by ItemNo and OrderNo
    async logReturn(itemNo: number, orderNo: number, returnsNo: number, generalNote: string | null) {
        var invoice = this.getInvoicebyOrderNo(orderNo);
        var item = this.getSingleInvoiceItem(itemNo, orderNo);
        if ((item != null || item != -999) && (invoice != null || invoice != -999)) {
            await this.db.run('UPDATE invoiceitems SET returnsNo = ? WHERE orderNo = ?', [returnsNo, orderNo]);
            if (generalNote != null) {
                await this.db.run('UPDATE invoices SET generalNote = ? WHERE orderNo = ?', [generalNote, orderNo]);
            }
        } else {
            console.log("Error logging return ...");
        }
    }

    // Log Discrepency by ItemNo and OrderNo
    async logDiscrepency(itemNo: number, orderNo: number, discrepencies: number, generalNote: string | null) {
        var invoice = this.getInvoicebyOrderNo(orderNo);
        var item = this.getSingleInvoiceItem(itemNo, orderNo);
        if ((item != null || item != -999) && (invoice != null || invoice != -999)) {
            await this.db.run('UPDATE invoiceitems SET discrepancies = ? WHERE orderNo = ?', [discrepencies, orderNo]);
            if (generalNote != null) {
                await this.db.run('UPDATE invoices SET generalNote = ? WHERE orderNo = ?', [generalNote, orderNo]);
            }
        } else {
            console.log("Error logging discrepency ...");
        }
    }

    // Log Credit Notes
    async logCreditNote(itemNo: number, orderNo: number, creditNotes: number, generalNote: string | null) {
        var invoice = this.getInvoicebyOrderNo(orderNo);
        var item = this.getSingleInvoiceItem(itemNo, orderNo);
        if ((item != null || item != -999) && (invoice != null || invoice != -999)) {
            await this.db.run('UPDATE invoiceitems SET creditNotes = ? WHERE orderNo = ?', [creditNotes, orderNo]);
            if (generalNote != null) {
                await this.db.run('UPDATE invoices SET generalNote = ? WHERE orderNo = ?', [generalNote, orderNo]);
            }
        } else {
            console.log("Error logging credit note ...");
        }
    }

    // Update Invoice Generated Status
    async updateInvoiceStatus(invoiceNo: number, status: string) {
        var invoice = this.getInvoice(invoiceNo);
        if (invoice != null) {
            await this.db.run('UPDATE invoices SET generate = ? WHERE invoiceNo = ?', [status, invoiceNo])
        } else {
            console.log("Error updating status ...");
        }
    }
    
    async getInvoices(): Promise<Record<string, any>[]> {
        try {
            const result = await this.db.query(`
                SELECT i.*, c.company 
                FROM invoices i
                JOIN customers c ON i.custNo = c.id;
            `);
    
            return result.values ?? []; // ✅ Ensure result.values is always an array
        } catch (error) {
            console.error("Error querying invoices:", error);
            return []; // ✅ Return an empty array on failure
        }
    }

    async isDatabaseEmpty(): Promise<boolean> {
        const invoices = await this.getInvoices()
        if (invoices.length == 0) {
            return true
        }
        return false
    }

    

}