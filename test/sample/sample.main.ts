import { ipcMain } from 'electron';

ipcMain.on('ping', (e: any) => e.returnValue = 'pong');
