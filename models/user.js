/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users(username,password,
      first_name,last_name,phone,join_at,last_login_at) VALUES($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    let user = result.rows[0];
    if (!user) {
      throw new ExpressError(`No such message: ${username}`, 404);
    }
    let authenticateResult = await bcrypt.compare(password, user.password);
    return authenticateResult;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {}

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
    );

    let m = result.rows[0];

    if (!m) {
      throw new ExpressError(`No such message`, 404);
    }

    return m;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT m.username, m.first_name,m.last_name,m.phone,m.join_at,
       m.last_login_at FROM users AS m WHERE m.username =$1`,
      [username]
    );
    let m = result.rows[0];
    if (!m) {
      throw new ExpressError(`No such message: ${username}`, 404);
    }
    return m;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = db.query(`
    SELECT t.id, t.to_user,t.body, t.sent,t.read_at, u.username,u.first_name,

    FROM messages AS t 

    JOIN users AS u ON t.to_username = u.username`);

    let m = result.rows[0];

    if (!m) {
      throw new ExpressError(`No such message: ${username}`, 404);
    }

    return m.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = db.query(
      `SELECT t.id, t.from_user,t.body,t.sent_at,
    t.read_at, u.first_name,u.last_name,u.phone from messages AS t
    JOIN users AS u ON t.from_username = u.username WHERE to_username=$1`,
      [username]
    );

    let m = result.rows[0];

    if (!m) {
      throw new ExpressError(`No such message: ${username}`, 404);
    }

    return m.map((s) => ({
      id: s.id,
      from_user: {
        username: s.from_username,
        first_name: s.first_name,
        last_name: s.last_name,
        phone: s.phone,
      },
      body: s.body,
      sent_at: s.sent_at,
      read_at: s.read_at,
    }));
  }
}

module.exports = User;
