const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('Admin123456', 10));