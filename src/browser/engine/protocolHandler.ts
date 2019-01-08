// import { readFile } from 'fs';
// import { join } from 'path';
// import { parse } from 'url';
// import { lookup } from 'mime-types';

// const protocolHandler = (
//   { url }: Electron.RegisterBufferProtocolRequest,
//   callback: Function
// ) => {
//   const { hostname, pathname } = parse(url)!;
//   if (!hostname || !pathname) return callback();

//   const extension = getExtensionById(hostname);
//   if (!extension) return callback();

//   const { src, backgroundPage: { name, html } } = extension;

//   if (`/${name}` === pathname) {
//     return callback({
//       mimeType: 'text/html',
//       data: html,
//     });
//   }

//   // todo(hugo) check permissions
//   readFile(
//     join(src, pathname),
//     (error, content) => {
//       if (error) {
//         return callback(-6); // FILE_NOT_FOUND
//       }

//       const mimeType = lookup(pathname);

//       if (mimeType) {
//         return callback({
//           mimeType,
//           data: content,
//         });
//       }

//       return callback(content);
//     }
//   );
// };

// export default protocolHandler;
