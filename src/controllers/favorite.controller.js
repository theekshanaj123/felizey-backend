const prisma = require("../config/db");

exports.addFavorite = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User_id is required." });
    }
    if (!event_id) {
      return res.status(400).json({ message: "Event_id is required." });
    }

    const isExist = await prisma.favorite.findFirst({
      where: {
        event_id: event_id,
        user_id: user_id,
      },
    });

    if (isExist) {
      await prisma.favorite.delete({ where: { id: isExist.id } });

      return res
        .status(200)
        .json({ status: true, message: "Favorite deleted." });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          user: {
            connect: {
              id: user_id,
            },
          },
          event: {
            connect: {
              id: event_id,
            },
          },
        },
      });

      return res.status(200).json({ status: true, message: "Favorite Added." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Favorite id is required." });
    }

    await prisma.favorite.delete({ where: { id } });

    return res.status(200).json({ status: true, message: "Favorite deleted." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getFavoritesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const favorites = await prisma.favorite.findMany({
      where: { user_id },
      include: {
        event: true,
      },
    });

    return res.status(200).json({ status: true, data: favorites });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
