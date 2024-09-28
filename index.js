const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// require('dotenv').config()
// var bodyParser = require('body-parser');
// const multer = require('multer');

// const upload = multer({
//     dest: 'uploads/',
//     limits: { fileSize: 10 * 1024 * 1024 }
// })

const app = express();
app.use(express.json());
app.use(cookieParser());


// app.use(bodyParser.json({
//     limit: '50mb'
// }));

// app.use(bodyParser.urlencoded({
//     limit: '50mb',
//     parameterLimit: 100000,
//     extended: true
// }));

// bodyParser = {
//     json: {limit: '50mb', extended: true},
//     urlencoded: {limit: '50mb', extended: true}
// };
// app.use(bodyParser.json({
//     limit: '50mb'
// }));

// Increase payload size limit
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(express.bodyParser({limit: '50mb'}));
// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb', extended: true}));

// app.use(bodyParser.json({limit: "5mb"}));
// app.use(bodyParser.urlencoded({limit: "5mb", extended: true}));


app.use(cors());

const port = 5000;


const Images = require('./model/imageSchema');
const Users = require('./model/users');


mongoose.connect("mongodb+srv://salman:123@cluster0.07dz1.mongodb.net/com-test?retryWrites=true&w=majority", { dbName: "images" })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));


// app.get('/', (req, res) => {
//     try {
//         Images.find({}).then(data => {
//             res.json(data)
//         }).catch(error => {
//             res.status(408).json({ error })
//         })
//     } catch (error) {
//         res.json({ error })
//     }
// })

// app.post('/upload', async (req, res) => {
//     const body = req.body;
//     try {
//         const newImage = await Images.create(body)
//         newImage.save();
//         res.status(201).json({ msg: "New image uploaded...!" })
//     } catch (error) {
//         res.status(409).json({ message: error.message })
//     }
// })


const multer = require("multer");
const auth = require('./middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "_" + file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post("/upload-image", upload.single("myFile"), async (req, res) => {
    // console.log(req.body);
    const imageName = req.file.filename;

    try {
        await Images.create({ myFile: imageName, fileLink: `${req.protocol}://${req.hostname}/uploads/${imageName}` });
        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.json({ status: error });
    }
});

app.get("/", async (req, res) => {
    // console.log(`${req.protocol}://${req.hostname}`);
    try {
        Images.find({}).then((data) => {
            res.status(200).send({ status: "ok", data: data });
        });
    } catch (error) {
        res.json({ status: error });
    }
    // res.send("Hello World!");
});


app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        //All field must not be empty
        if (!(name && email && password)) {
            res.status(400).send({ message: "All field must not be empty" })
        }

        //Check the user is exist or not
        const existingUser = await Users.findOne({ email })
        if (existingUser) {
            res.status(401).send({ message: "user already exist with this email" })
        }

        const encryptedPass = await bcrypt.hash(password, 10);

        const user = await Users.create({
            name,
            email,
            password: encryptedPass
        })

        user.password = undefined
        res.status(200).json({ message: "User Created Successfully!", user })

    } catch (error) {
        console.log(error)
    }
})


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        //All field must not be empty
        if (!(email && password)) {
            res.status(400).send({ message: "All field must not be empty" })
        }

        //Check the user is exist or not
        const user = await Users.findOne({ email })
        if (!user) {
            res.status(401).send({ message: "User is not exist, please use correct credentials" })
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user._id },
                'shhhh', // process.env.jwtsecret
                // {
                //     expiresIn: "2h"
                // },



                // (err, token) => {
                //     if (err) {
                //         console.log(err);
                //     }
                //     user.password = undefined
                //     res.status(200).json({ message: "Login Successfully!", user, token })
                // }
            );
            user.token = token;
            user.password = undefined;
            
            // Cookie section
            const options = {
                httpOnly: true
            };
            res.status(200).cookie("token", token, options).json({ message: "Login Successfully!", user, token });
            
            
        }

    } catch (error) {
        console.log(error);
    }
})

app.get("/profile", auth, async(req, res) => {
    
    const profile = await Users.findById({ _id: req.user.id });
    profile.password = undefined;

    res.json({ message: "Welcome to profile!", profile });
})


app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

