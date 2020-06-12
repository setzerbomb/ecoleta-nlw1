import message from '../common/message';
import knex from '../../database/connection';

function PointController() {
  const self = {
    index: async (req: Express.Request, res: Express.Response) => {
      const { id } = req.params;

      try {
        const point = await knex('points').where('id', id).first();

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
              image:
                'https://images.unsplash.com/photo-1545601445-4d6a0a0565f0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80',
              name: point.name,
              email: point.email,
              whatsapp: point.whatsapp,
              latitude: point.latitude,
              longitude: point.longitude,
              city: point.city,
              uf: point.uf,
            })
            .returning(['id'])
        )[0];

        const { items } = point;

        const pointItems = items.map((itemId: number) => {
          return {
            item_id: itemId,
            point_id: pointId,
          };
        });

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return res.json({ id: pointId, ...point });
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
          .modify(
            (builder) =>
              parsedItems[0] &&
              builder.whereIn('point_items.item_id', parsedItems)
          )
          .modify((builder) => city && builder.andWhere('city', String(city)))
          .modify((builder) => uf && builder.andWhere('uf', String(uf)))
          .distinct()
          .select('points.*');
        return res.json(points);
      } catch (e) {
        return message(res, 401, e.message);
      }
    },
  };

  return self;
}

export default PointController();
