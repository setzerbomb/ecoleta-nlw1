import { Router } from 'express';

import PointController from './app/controllers/PointController';
import ItemController from './app/controllers/ItemController';

const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'It Works' });
});

routes.get('/items', ItemController.list);

routes.post('/points', PointController.store);
routes.get('/points', PointController.list);
routes.get('/points/:id', PointController.index);

export default routes;
