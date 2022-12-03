const bcrypt = require('bcryptjs')

//lookup user by email
const getUserByEmail = (email, users) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user]
        }
    }

    return false
};



module.exports = { getUserByEmail }