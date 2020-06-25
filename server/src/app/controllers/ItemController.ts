import message from '../common/message';
import knex from '../../database/connection';

import settings from '../../settings';

function ItemController() {
  const self = {
    list: async (req: Express.Request, res: Express.Response) => {
      const items = (await knex('items').select('*')).map(
        ({ id, title, image }) => {
          return {
            id,
            title,
            image_url: `${settings.base_url}:${settings.port}/uploads/${image}`,
          };
        }
      );

      return res.json(items);
    },
  };

  return self;
}

export default ItemController();
