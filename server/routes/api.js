const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// get config vars
dotenv.config();

// google Oauth
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let generateAccessToken = (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    let authToken = req.signedCookies['authToken'];

    req.userInfo = null;

    if (typeof (authToken) != 'string' || authToken == '') {
        next()
        return;
    }
    jwt.verify(authToken, process.env.TOKEN_SECRET, (err, user) => {
        //console.log(err);
        if (err) {
            //console.log('authentication error !!!');
            //return res.sendStatus(403)
        } else {
            req.userInfo = user;
        }
        next()
    })
}

module.exports = (contract) => {

    router.post('/sign-in', authenticateToken, async (req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo != null) {
            res.status(200);
            res.json(req.userInfo);
            return;
        }

        // verify google token and generate access token for user
        try {
            if ([undefined, null, ''].includes(req.body.accessToken)) throw new Error('Access token should be a valid string!');
            const ticket = await googleClient.verifyIdToken({
                idToken: req.body.accessToken,
                audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();

            let userInfo = {
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                imageUrl: payload.picture
            }

            let accessToken = generateAccessToken(userInfo);

            res.cookie('authToken', accessToken, { maxAge: 30 * 60 * 1000, httpOnly: true, signed: true });

            res.status(201);
            res.json(userInfo);

        } catch (err) {
            //console.log(err)
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return
        }
    });

    router.post('/logout', async (req, res) => {
        res.clearCookie("authToken", { signed: true });
        res.status(200);
        res.send('OK');
    });

    // Api for creating new vote
    router.post('/create-new-vote', authenticateToken, async (req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }

        let voteName = req.body.voteName, voteDescription = req.body.voteDescription,
            listChoices = req.body.listChoices, timeStart = new Date(req.body.timeStart), timeFinish = new Date(req.body.timeFinish),
            timezone = req.body.timeZone;

        // validation
        try {
            if (typeof(voteName) != 'string' || typeof(voteDescription) != 'string' || Array.isArray(listChoices) != true
                || Math.min(voteName.length, voteDescription.length) <= 0
                || voteName.length > 300 || voteDescription.length > 1000
                || typeof(timezone) != 'number' || Math.round(timezone * 2) != timezone * 2 || timezone < -11 || timezone > 13) throw new Error("invalid data!");
            
            if(isNaN(Date.parse(timeStart)) || isNaN(Date.parse(timeFinish))
                || new Date().getTime() + 60 * 1000 > timeStart.getTime()
                || timeStart.getTime() + 60 * 1000 > timeFinish.getTime()) throw new Error("invalid data!");
            
            for (let i = 0; i < listChoices.length; ++i) {
                if (typeof(listChoices[i]) != 'object' || Object.keys(listChoices[i]).length != 2
                    || typeof(listChoices[i].name) != 'string' || typeof(listChoices[i].description) != 'string'
                    || Math.min(listChoices[i].name.length, listChoices[i].description.length) <= 0
                    || listChoices[i].name.length > 100 || listChoices[i].description.length > 500)
                    throw new Error('invalid data!');
            }
        } catch (err) {
            console.log(err);
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        timezone *= 60;

        // call to the blockchain to process request
        try{
            let voteId = await contract.createVote({
                userId: req.userInfo.googleId,
                vote_name: voteName,
                description: voteDescription,
                time_start: timeStart.getTime().toString(),
                vote_period: (timeFinish.getTime() - timeStart.getTime()).toString(),
                rawChoices: listChoices.map(x => [x.name,x.description]),
                timezone : timezone.toString()
            },
            300000000000000, /* attached GAS (optional)*/);
            
            console.log('new vote ',voteId,' created!');
            res.status(201);
            res.json({
                msg : 'Create new vote successfully!',
                data : {
                    voteId : voteId
                }
            })

        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });

    router.post('/get-vote-info', authenticateToken, async(req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }
        
        let voteId = req.body.voteId;

        // validation
        try {
            if (typeof(voteId) != 'string' || voteId.length < 6 || voteId.length > 20) throw new Error("invalid data!");
        } catch (err) {
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        // call to the blockchain to process request
        try{
            let voteInfo = await contract.getVoteInfo({
                voteId : voteId
            });

            console.log('get info of vote ',voteId);
            res.status(200);

            voteInfo.joined = voteInfo.list_participants.includes(req.userInfo.googleId.toString());
            voteInfo.voted = voteInfo.list_participants_voted.includes(req.userInfo.googleId.toString());
            res.json({
                msg : 'Get vote info successfully!',
                data : {
                    voteInfo : voteInfo
                }
            })

        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });


    router.post('/get-user-data', authenticateToken, async(req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }
        
        let userId = req.body.userId;

        // validation
        try {
            if(userId != req.userInfo.googleId) throw new Error("invalid data!");
        } catch (err) {
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        // call to the blockchain to process request
        try{
            let userData = await contract.getUserData({
                userId : userId
            });

            console.log('get data of user ',userId,' successfully!');
            res.status(200);

            res.json({
                msg : 'Get user data successfully!',
                data : {
                    userData : userData
                }
            })

        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });
    
    router.post('/register-vote', authenticateToken, async (req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }

        let voteId = req.body.voteId;

        // validation
        try {
            if (typeof(voteId) != 'string' || voteId.length > 40) throw new Error("invalid data");
        } catch (err) {
            console.log(err);
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        // call to the blockchain to process request
        try{
            let result = await contract.registerVote({
                userId: req.userInfo.googleId,
                voteId: voteId
            },
            300000000000000, /* attached GAS (optional)*/);

            if(result != true) throw new Error("");
            console.log('user ',req.userInfo.googleId,' registered vote ',voteId,' successfully!!!');

            res.status(201);
            res.json({
                msg : 'Register vote successfully!',
                data : {
                    userId : req.userInfo.googleId,
                    voteId : voteId
                }
            })

        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });

    router.post('/unregister-vote', authenticateToken, async (req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }

        let voteId = req.body.voteId;

        // validation
        try {
            if (typeof(voteId) != 'string' || voteId.length > 40) throw new Error("invalid data");
        } catch (err) {
            console.log(err);
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        // call to the blockchain to process request
        try{
            let result = await contract.unregisterVote({
                userId: req.userInfo.googleId,
                voteId: voteId
            },
            300000000000000, /* attached GAS (optional)*/);

            if(result != true) throw new Error("");
            console.log('user ',req.userInfo.googleId,' unregistered from vote ',voteId,' successfully!!!');

            res.status(201);
            res.json({
                msg : 'Unregister vote successfully!',
                data : {
                    userId : req.userInfo.googleId,
                    voteId : voteId
                }
            })

        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });

    router.post('/vote-for', authenticateToken, async (req, res) => {
        res.set('Content-Type', 'application/json');
        if (req.userInfo == null) {
            res.status(440);
            res.json({
                msg: 'User hasn\'t logged in yet!'
            });
            return;
        }

        let voteId = req.body.voteId, listChoices = req.body.choices;

        // validation
        try {
            if (typeof(voteId) != 'string' || voteId.length > 40) throw new Error("invalid data");
            for(let i = 0; i < listChoices.length; ++i){
                if(typeof(listChoices[i]) != 'string' || listChoices[i].length > 40) throw new Error("invalid data");
            }
        } catch (err) {
            console.log(err);
            res.status(400);
            res.json({
                msg: 'Data requested is not valid!'
            });
            return 
        }

        console.log(listChoices)

        // call to the blockchain to process request
        try{
            let result = await contract.voteFor({
                userId: req.userInfo.googleId,
                voteId: voteId,
                listOfChoices : listChoices
            },
            300000000000000, /* attached GAS (optional)*/);

            if(result != true) throw new Error("");
            console.log('user ',req.userInfo.googleId,' vote for ',listChoices,' in vote ',voteId,' successfully!!!');

            res.status(201);
            res.json({
                msg : 'Vote successfully!',
                data : {
                    userId : req.userInfo.googleId,
                    voteId : voteId,
                    listChoices : listChoices
                }
            });
        }catch(err){
            console.log(err)
            res.status(500);
            res.json({
                msg : 'Internal Server Error!'
            });
        }

        return
    });

    router.get('/helloworld', (req, res) => {
        res.send('hello World!');
    });

    return router;
}