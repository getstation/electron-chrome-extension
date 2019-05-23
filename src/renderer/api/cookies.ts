import { Api } from '../../common';
import { IExtension } from '../../common/types';
import { Methods } from '../../common/apis/cookies';

import Event from './event';
import line from './line';

export const cookies = (extensionId: IExtension['id']) => {
  const call = line<Methods>(Api.Cookies, extensionId);

  return {
    set: call(Methods.Set),
    get: call(Methods.Get),
    remove: call(Methods.Remove),
    getAll: call(Methods.GetAll),
    getAllCookieStores: call(Methods.GetAllCookieStores),

    onChanged: new Event(),
  };
};

export default cookies;
