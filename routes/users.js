const Router = require("express").Router;
const router = new Router();
const ExpressError = require("../expressError");
const User = require("../models/user");

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const result = await User.all();
    return res.json({ result });
  } catch (err) {
    return next(err);
  }
});
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async function (req, res, next) {
  try {
    const username = req.params.username;
    let result = await User.get(username);
    if (!result) {
      throw new ExpressError("no user", 401);
    }

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", async function (req, res, next) {
  try {
    const username = req.params.username;
    let result = await User.messagesTo(username);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", async function (req, res, next) {
  try {
    const username = req.params / username;
    let result = await User.messagesFrom(username);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
