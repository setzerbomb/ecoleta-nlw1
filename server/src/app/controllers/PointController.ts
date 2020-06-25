import message from '../common/message';
import knex from '../../database/connection';

import settings from '../../settings';

function PointController() {
  const self = {
    index: async (req, res: Express.Response) => {
      const { id } = req.params;

      try {
        const point = await knex('points')
          .join('files', 'points.file_id', '=', 'files.id')
          .where('points.id', id)
          .select([
            'points.id',
            'points.name',
            'points.email',
            'points.whatsapp',
            'points.latitude',
            'points.longitude',
            'points.city',
            'points.uf',
            'files.path as image_url',
          ])
          .first();
        if (point?.image_url) {
          point.image_url = `${settings.base_url}:${settings.port}/uploads/${
            point.image_url || ''
          }`;
        }

        if (!point) {
          throw new Error('Point not found');
        }

        const items = await knex('items')
          .join('point_items', 'items.id', '=', 'point_items.item_id')
          .where('point_items.point_id', id)
          .select(['items.title']);

        return res.json({ point, items });
      } catch (e) {
        return message(res, 400, e.message);
      }
    },

    store: async (req: Express.Request, res: Express.Response) => {
      const { body: point } = req;
      try {
        const trx = await knex.transaction();

        const { id: pointId } = (
          await trx('points')
            .insert({
              file_id: req.file_id,
              name: point.name,
              email: point.email,
              whatsapp: point.whatsapp,
              latitude: point.latitude,
              longitude: point.longitude,
              city: point.city,
              uf: point.uf,
            })
            .returning(['id', 'file_id'])
        )[0];

        const {
          items,
          name,
          email,
          whatsapp,
          latitude,
          longitude,
          city,
          uf,
        } = point;

        const pointItems = items
          .split(',')
          .map((itemString: string) => Number(itemString.trim()))
          .map((itemId: number) => {
            return {
              item_id: itemId,
              point_id: pointId,
            };
          });

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return res.json({
          id: pointId,
          name,
          email,
          whatsapp,
          latitude,
          longitude,
          city,
          uf,
          image_url: `${settings.base_url}:${settings.port}/uploads/${req.image}`,
        });
      } catch (e) {
        return message(res, 401, e.message);
      }
    },
    list: async (req: Express.Request, res: Express.Response) => {
      const { city, uf, items } = req.query;

      const parsedItems = items
        ? String(items)
            .split(',')
            .map((item) => (Number(item.trim()) ? Number(item.trim()) : 0))
        : [];
      try {
        const points = await knex('points')
          .join('point_items', 'points.id', '=', 'point_items.point_id')
          .join('files', 'points.file_id', '=', 'files.id')
          .modify(
            (builder) =>
              parsedItems[0] &&
              builder.whereIn('point_items.item_id', parsedItems)
          )
          .modify((builder) => city && builder.andWhere('city', String(city)))
          .modify((builder) => uf && builder.andWhere('uf', String(uf)))
          .distinct()
          .select([
            'points.id',
            'points.name',
            'points.email',
            'points.whatsapp',
            'points.latitude',
            'points.longitude',
            'points.city',
            'points.uf',
            'files.path as image_url',
          ]);
        points.forEach((point) => {
          if (point?.image_url) {
            point.image_url = `${settings.base_url}:${settings.port}/uploads/${
              point?.image_url || ''
            }`;
          }
        });

        return res.json(points);
      } catch (e) {
        return message(res, 401, e.message);
      }
    },
  };

  return self;
}

export default PointController();
