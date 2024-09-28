const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
    //grab token from bearer header 
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        // req.token = bearerToken;
        try {
            //Decode token
            const decode = jwt.verify(bearerToken, 'shhhh')
            // console.log(decode);
            req.user = decode;  
        } catch (error) {
            console.log(error);
            res.status(401).json({ Error: "INVALID Token" });
        }
        next();
    } else {
        res.status(403).json({ Error: "Please login first" });
    }
}

module.exports = auth;
