import { Router } from 'express';
import { MATERIALS, MATERIAL_PRICE } from '../game/content.js';
import { httpError } from '../utils/http.js';

const router = Router();

// GET /api/shop -> materials for the user's categories and their prices
router.get('/', (req, res) => {
  const items = Object.values(MATERIALS)
    .filter((m) => req.user.categories.includes(m.category))
    .map((m) => ({ ...m, price: MATERIAL_PRICE, owned: req.user.materials.get(m.id) || 0 }));
  res.json({ coins: req.user.coins, items });
});

// POST /api/shop/buy  { materialId, quantity? }
router.post('/buy', async (req, res) => {
  const user = req.user;
  const { materialId } = req.body || {};
  const quantity = Math.max(1, Math.min(20, Math.floor(Number(req.body?.quantity) || 1)));
  const material = MATERIALS[materialId];
  if (!material || !user.categories.includes(material.category)) throw httpError(400, 'Unknown material');

  const cost = MATERIAL_PRICE * quantity;
  if (user.coins < cost) throw httpError(400, `Not enough coins: need ${cost}, have ${user.coins}`);

  user.coins -= cost;
  user.materials.set(materialId, (user.materials.get(materialId) || 0) + quantity);
  await user.save();
  res.json({ coins: user.coins, materialId, owned: user.materials.get(materialId) });
});

export default router;
