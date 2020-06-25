import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';

import PointController from './app/controllers/PointController';
import ItemController from './app/controllers/ItemController';
import FileController from './app/controllers/FileController';

const routes = Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'It Works' });
});

routes.get('/items', ItemController.list);

routes.post(
  '/points',
  upload.single('file'),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        items: Joi.string().required(),
      }),
    },
    {
      abortEarly: false,
    }
  ),
  FileController.store,
  PointController.store
);
routes.get('/points', PointController.list);
routes.get('/points/:id', PointController.index);

export default routes;
