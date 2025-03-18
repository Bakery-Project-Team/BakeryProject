export class UserUpgradeStatements {
    userUpgrades = [
        {
        toVersion: 2,
        statements: [
            `PRAGMA foreign_keys = ON;`,
            `CREATE TABLE IF NOT EXISTS customers(
            id INTEGER PRIMARY KEY,
            areaNo INTEGER NOT NULL,
            lastInvoiceDate NOT NULL,
            company TEXT NOT NULL,
            contact TEXT,
            email TEXT,
            phone TEXT,
            terms TEXT,
            type TEXT,
            addr1 TEXT,
            addr2 TEXT
            );`,
            `CREATE TABLE IF NOT EXISTS invoices(
            invoiceNo INTEGER PRIMARY KEY,
            orderNo INTEGER UNIQUE NOT NULL,
            custNo INTEGER NOT NULL,
            routeNo TEXT NOT NULL,
            standingDay TEXT NOT NULL,
            invoiceDate TEXT NOT NULL,
            generate TEXT NOT NULL,
            generalNote TEXT,
            custDiscount REAL NOT NULL,
            taxRate REAL NOT NULL,
            terms TEXT,
            totalDiscount REAL NOT NULL,
            totalDiscount_adjdown REAL NOT NULL,
            totalDiscount_adjup REAL NOT NULL,
            totalItems REAL NOT NULL,
            totalItems_adjdown REAL NOT NULL,
            totalItems_adjup REAL NOT NULL,
            totalVat REAL NOT NULL,
            totalVat_adjdown REAL NOT NULL,
            totalVat_adjup REAL NOT NULL,
            FOREIGN KEY (custNo) REFERENCES customers(id) ON DELETE CASCADE
            );`,
            `CREATE TABLE IF NOT EXISTS invoiceitems(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemNo INTEGER NOT NULL,
            numPerPack REAL NOT NULL,
            orderNo INTEGER NOT NULL,
            packs REAL NOT NULL,
            partNo TEXT NOT NULL,
            quantity REAL NOT NULL,
            returnsNo REAL NOT NULL,
            price REAL NOT NULL,
            vat REAL NOT NULL,
            vatRate REAL NOT NULL,
            discrepancies REAL NOT NULL,
            discount REAL NOT NULL,
            creditNotes INTEGER NOT NULL,
            FOREIGN KEY (orderNo) REFERENCES invoices(orderNo) ON DELETE CASCADE
            );`
        ]
        },
        //{
            /*
        toVersion: 2,
        statements: [
            
        ]
            */
       // },
    ]
}    