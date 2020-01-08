import { IpcMainImpl } from './ipc-main-impl';

export const ipcMainInternal = new IpcMainImpl() as any;

// Do not throw exception when channel name is "error".
ipcMainInternal.on('error', console.error);
