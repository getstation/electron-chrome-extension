import { Methods } from '../../common/apis/windows';
import { Api } from '../../common/';
import { IExtension } from '../../common/types';
import { createWire } from '../wire';

import Event from './event';

export const windows = (extensionId: IExtension['id']) => {
  const bind = createWire<Methods>(Api.Windows, extensionId);

  return {
    WINDOW_ID_NONE: -1,
    WINDOW_ID_CURRENT: -2,

    get: bind(Methods.Get),
    getCurrent: bind(Methods.GetCurrent),
    getLastFocused: bind(Methods.GetLastFocused),
    getAll: bind(Methods.GetAll),
    create: bind(Methods.Create),
    update: bind(Methods.Update),
    remove: bind(Methods.Remove),

    onChanged: new Event(),
  };
};

export default windows;
