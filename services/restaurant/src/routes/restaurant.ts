import express from 'express';
import {isAuth, isSeller} from '../middlewares/isAuth.js';
import { addRestaurant, fetchMyRestaurant } from '../controllers/restaurant.js';
import uploadFile from '../middlewares/multer.js';
import { updateStatusRestaurant, updateRestaurant } from '../controllers/restaurant.js';
import { getNearbyRestaurant, fetchSingleRestaurant } from '../controllers/restaurant.js';

const router = express.Router();

router.post('/new', isAuth, isSeller, uploadFile, addRestaurant);
router.get('/my', isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant);
router.put("/edit", isAuth, isSeller, updateRestaurant);
router.get("/all", isAuth, getNearbyRestaurant);
router.get("/:id", isAuth, fetchSingleRestaurant);

export default router;


