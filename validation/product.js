const { body } = require("express-validator");

const productValidation = [
  body("title", "The title should only contains words and numbers")
    .isLength({ min: 3, max: 20 })
    .withMessage(
      "the title should have at least 3 charector and at most 20 charector"
    )
    .isString().trim(),
  // body("imageUrl", "The image should be a URL of that image")
  //   .isLength({ min: 5})
  //   .withMessage(
  //     "the image should have at least 5 charector "
  //   ).isURL(),
  body("price", "The price should be numerical")
    .isLength({ min: 4})
    .withMessage(
      "the price should have at least 4 charector "
    ).isFloat (),
    body("description").isLength({min: 10}).withMessage("The description should contains at least 5 charector")
];

module.exports = {
    productValidation,
}