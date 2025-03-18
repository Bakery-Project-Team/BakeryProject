import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { StorageService } from './storage.service';
import { Toast } from '@capacitor/toast';
import { DataService } from './data.service';

@Injectable()
export class InitializeAppService {
    isAppInit: boolean = false;
    platform!: string;

    constructor(private sqliteService: SQLiteService, private storageService: StorageService, private dataService: DataService) {
    }

    async initializeApp() {
        await this.sqliteService.initializePlugin().then(async (ret) => {
            this.platform = this.sqliteService.platform;
            try {
                if (this.sqliteService.platform === 'web') {
                    await this.sqliteService.initWebStore();
                }

                const DB_CUSTOMERS = 'deliveryManagementDB'
                await this.storageService.initializeDatabase(DB_CUSTOMERS);

                // Here Initialize MOCK_DATA if required
                // Initialize whatever database and/or MOCK_DATA you like
                if (await this.storageService.isDatabaseEmpty() == true ) {
                    await this.dataService.getData()
                }

                if (this.sqliteService.platform === 'web') {
                    await this.sqliteService.saveToStore(DB_CUSTOMERS);
                }

                this.isAppInit = true;
            } catch (error) {
                console.log(`initializeAppError: ${error}`);
                await Toast.show({
                    text: `initializeAppError: ${error}`,
                    duration: 'long'
                });
            }
        });
    }
}
