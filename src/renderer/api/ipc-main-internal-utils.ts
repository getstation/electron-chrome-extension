import { ipcMainInternal } from './ipc-main-internal';

type IPCHandler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;

export const handleSync = <T extends IPCHandler> (channel: string, handler: T) => {
  ipcMainInternal.on(channel, async (event: any, ...args: any[]) => {
    try {
      event.returnValue = [null, await handler(event, ...args)];
    } catch (error) {
      event.returnValue = [error];
    }
  });
};

let nextId = 0;

export const invokeInWebContents = <T> (sender: any, sendToAll: boolean, command: string, ...args: any[]) => {
  return new Promise<T>((resolve, reject) => {
    nextId = nextId + 1;
    const requestId = nextId;
    const channel = `${command}_RESPONSE_${requestId}`;

    const handler = (
      event: any, error: any, result: any
    ) => {
      if (event.sender !== sender) {
        console.error(`Reply to ${command} sent by unexpected WebContents (${event.sender.id})`);
        return;
      }

      ipcMainInternal.removeListener(channel, handler);

      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };

    ipcMainInternal.on(channel, handler);

    if (sendToAll) {
      sender._sendInternalToAll(command, requestId, ...args);
    } else {
      sender._sendInternal(command, requestId, ...args);
    }
  });
};
