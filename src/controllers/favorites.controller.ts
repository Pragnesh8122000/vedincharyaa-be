import { Request, Response } from "express";
import { Favorite } from "../models/Favorite";
import { HTTP_CODES } from "../common/httpCodes";
import { findShlokResiliently } from "../utils/shlokLoader";

export const getFavorites = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });

    const favoriteShlokPromises = favorites.map(async (fav) => {
      const parts = fav.shlokId.split("-");
      const chapter = Number(parts[0]);
      const verse = Number(parts[1]);

      const shlok = await findShlokResiliently(chapter, verse);
      return shlok
        ? {
            ...(shlok.toObject ? shlok.toObject() : shlok),
            addedAt: fav.createdAt,
          }
        : null;
    });

    const favoriteShloks = (await Promise.all(favoriteShlokPromises)).filter(
      (item) => item !== null
    );

    res.sendResponse(true, HTTP_CODES.OK, "FAVORITES_FETCHED", favoriteShloks);
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "FAVORITES_FETCH_ERROR"
    );
  }
};

export const addFavorite = async (req: any, res: Response) => {
  const { shlokId } = req.body;
  const userId = req.user.id;

  if (!shlokId) {
    return res.sendResponse(false, HTTP_CODES.BAD_REQUEST, "SHLOK_ID_REQUIRED");
  }

  try {
    const existing = await Favorite.findOne({ userId, shlokId });
    if (existing) {
      return res.sendResponse(true, HTTP_CODES.OK, "FAVORITE_EXISTS", {
        shlokId,
      });
    }

    await Favorite.create({ userId, shlokId });
    res.sendResponse(true, HTTP_CODES.OK, "FAVORITE_ADDED", { shlokId });
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "FAVORITE_ADD_ERROR"
    );
  }
};

export const removeFavorite = async (req: any, res: Response) => {
  const { shlokId } = req.params;
  const userId = req.user.id;

  try {
    await Favorite.findOneAndDelete({ userId, shlokId });
    res.sendResponse(true, HTTP_CODES.OK, "FAVORITE_REMOVED", { shlokId });
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "FAVORITE_REMOVE_ERROR"
    );
  }
};

export const clearFavorites = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    await Favorite.deleteMany({ userId });
    res.sendResponse(true, HTTP_CODES.OK, "FAVORITES_CLEARED");
  } catch (error) {
    res.sendResponse(
      false,
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "FAVORITES_CLEAR_ERROR"
    );
  }
};
