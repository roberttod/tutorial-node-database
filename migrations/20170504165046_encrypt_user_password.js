const { saltHashPassword } = require('../store')

exports.up = async function up (knex) {
  await knex.schema.table('user', t => {
    t.string('salt').notNullable()
    t.string('encrypted_password').notNullable()
  })
  const users = await knex('user')
  await Promise.all(users.map(convertPassword))
  await knex.schema.table('user', t => {
    t.dropColumn('password')
  })

  function convertPassword (user) {
    const { salt, hash } = saltHashPassword(user.password)
    return knex('user')
      .where({ id: user.id })
      .update({
        salt,
        encrypted_password: hash
      })
  }
}

exports.down = function down (knex) {
  return knex.schema.table('user', t => {
    t.dropColumn('salt')
    t.dropColumn('encrypted_password')
    t.string('password').notNullable()
  })
}
