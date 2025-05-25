const router = require("express").Router();
const cartController = require("../controllers/cart.controller");
const { checkAccessToken } = require("../middlewares/auth.middleware");

router.use(checkAccessToken); // Apply to all cart routes

router.get("/", cartController.getCartItems);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeCartItem);

module.exports = router;
