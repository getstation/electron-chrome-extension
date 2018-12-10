import { ipcMain } from 'electron';

ipcMain.on('test-me', (e: any) => e.returnValue = 'pong');
