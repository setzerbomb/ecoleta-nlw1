import message from '../common/message';
import knex from '../../database/connection';

function FileController() {
  const self = {
    store: async (req, res: Express.Response, next: Function) => {
      try {
        const { originalname: name, filename: path } = req.file;
        const trx = await knex.transaction();

        const { id } = (
          await trx('files')
            .insert({
              name,
              path,
            })
            .returning(['id'])
        )[0];

        await trx.commit();

        req.file_id = id;
        req.image = path;

        return next();
      } catch (e) {
        return message(res, 401, e.message);
      }
    },
  };

  return self;
}

export default FileController();
