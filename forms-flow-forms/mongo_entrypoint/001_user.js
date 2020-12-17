require('dotenv').config();
const user  = process.env("FORMIO_MONGO_USERNAME");
const password = process.env("FORMIO_MONGO_PASSWORD");

db.createUser(
    {
        user: user,
        pwd:  password,
        roles:[
            {
                role: "readWrite",
                db:  "admin"
            }
        ]
    }
);