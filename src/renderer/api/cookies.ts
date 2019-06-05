import { Api } from '../../common';
import { IExtension } from '../../common/types';
import { Methods } from '../../common/apis/cookies';
import { createWire } from '../wire';

import Event from './event';

export const cookies = (extensionId: IExtension['id']) => {
  const bind = createWire<Methods>(Api.Cookies, extensionId);

  return {
    set: bind(Methods.Set),
    get: bind(Methods.Get),
    remove: bind(Methods.Remove),
    getAll: bind(Methods.GetAll),
    getAllCookieStores: bind(Methods.GetAllCookieStores),

    onChanged: new Event(),
  };
};

export default cookies;
