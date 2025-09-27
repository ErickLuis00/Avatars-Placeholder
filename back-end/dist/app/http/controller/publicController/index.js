"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');
class publicController {
    constructor() {
        this.publicNameAvatar = process.env.AVATAR_PUBLIC_NAME ? process.env.AVATAR_PUBLIC_NAME : "";
        this.foramtFile = process.env.AVATAR_FORAMT_FILE ? process.env.AVATAR_FORAMT_FILE : "";
        //helper function
        this.getImagePath = (folderName, startIndex, endIndex) => {
            //Generate Random
            const randomIndex = Math.floor(Math.random() * ((endIndex + 1) - startIndex)) + startIndex;
            const imageName = this.publicNameAvatar + randomIndex + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            return path;
        };
        this.get404Avatar = () => {
            const path = `${process.env.UPLOAD_DIR}/${process.env.AVATAR_404}`;
            return path;
        };
        this.getImageByUsername = (username, folderName, startIndex, endIndex) => {
            //username convert to number value
            let usernameValue = 0;
            for (let i = 0; i < username.length; i++) {
                usernameValue += username.charCodeAt(i);
            }
            const idAvatar = ((usernameValue % ((endIndex + 1) - startIndex)) + startIndex).toString();
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            return path;
        };
        //Generate deterministic number from seed using simple hash
        this.getDeterministicValue = (seed, range) => {
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash) % range;
        };
        this.getImageBySeed = (seed, folderName, startIndex, endIndex) => {
            const range = (endIndex + 1) - startIndex;
            const deterministicIndex = this.getDeterministicValue(seed, range) + startIndex;
            const imageName = this.publicNameAvatar + deterministicIndex + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/${folderName}/${imageName}`;
            return path;
        };
        this.index = (req, res, next) => {
            var _a, _b;
            try {
                const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
                const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
                if (!startIndex || !endIndex || (startIndex > endIndex)) {
                    res.
                        status(200).
                        sendFile(this.get404Avatar(), { root: '.' });
                    return;
                }
                let path = null;
                let isDeterministic = false;
                if (req.query.seed) {
                    path = this.getImageBySeed(`${req.query.seed}`, "id", startIndex, endIndex);
                    isDeterministic = true;
                }
                else if (req.query.username) {
                    path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
                    isDeterministic = true;
                }
                else {
                    if ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.referer) {
                        console.log("=> Refer:", (_b = req.headers) === null || _b === void 0 ? void 0 : _b.referer);
                    }
                    path = this.getImagePath("id", startIndex, endIndex);
                    isDeterministic = false;
                }
                //console.log(path)
                if (path) {
                    // Add eternal cache headers for deterministic content (seed/username based)
                    if (isDeterministic) {
                        res.set({
                            'Cache-Control': 'public, max-age=31536000, immutable',
                            'Expires': new Date(Date.now() + 31536000000).toUTCString(), // 1 year
                            'ETag': `"${req.query.seed || req.query.username}"`
                        });
                    }
                    res.
                        status(200).
                        sendFile(path, { root: '.' });
                }
            }
            catch (err) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
            }
        };
        this.byId = (req, res, next) => {
            const idAvatar = parseInt(req.params.id);
            const startIndex = process.env.IMG_START_INDEX ? parseInt(process.env.IMG_START_INDEX) : 0;
            const endIndex = process.env.IMG_END_INDEX ? parseInt(process.env.IMG_END_INDEX) : 0;
            if (!startIndex || !endIndex || !idAvatar || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            if ((startIndex > idAvatar) || (idAvatar > endIndex)) {
                //console.log(this)
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            const imageName = this.publicNameAvatar + idAvatar + this.foramtFile;
            const path = `${process.env.UPLOAD_DIR}/id/${imageName}`;
            //console.log(path)
            if (path) {
                // Add eternal cache headers for deterministic content (byId is always deterministic)
                res.set({
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Expires': new Date(Date.now() + 31536000000).toUTCString(),
                    'ETag': `"id-${idAvatar}"`
                });
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        this.byGenderBoy = (req, res, next) => {
            const startIndex = process.env.IMG_BOY_START_INDEX ? parseInt(process.env.IMG_BOY_START_INDEX) : 0;
            const endIndex = process.env.IMG_BOY_END_INDEX ? parseInt(process.env.IMG_BOY_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let path = null;
            let isDeterministic = false;
            if (req.query.seed) {
                path = this.getImageBySeed(`${req.query.seed}`, "boy", startIndex, endIndex);
                isDeterministic = true;
            }
            else if (req.query.username) {
                path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
                isDeterministic = true;
            }
            else {
                path = this.getImagePath("boy", startIndex, endIndex);
                isDeterministic = false;
            }
            //console.log(path)
            if (path) {
                // Add eternal cache headers for deterministic content
                if (isDeterministic) {
                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Expires': new Date(Date.now() + 31536000000).toUTCString(),
                        'ETag': `"boy-${req.query.seed || req.query.username}"`
                    });
                }
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        this.byGenderGirl = (req, res, next) => {
            const startIndex = process.env.IMG_GIRL_START_INDEX ? parseInt(process.env.IMG_GIRL_START_INDEX) : 0;
            const endIndex = process.env.IMG_GIRL_END_INDEX ? parseInt(process.env.IMG_GIRL_END_INDEX) : 0;
            if (!startIndex || !endIndex || (startIndex > endIndex)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            let path = null;
            let isDeterministic = false;
            if (req.query.seed) {
                path = this.getImageBySeed(`${req.query.seed}`, "girl", startIndex, endIndex);
                isDeterministic = true;
            }
            else if (req.query.username) {
                path = this.getImageByUsername(`${req.query.username}`, "id", startIndex, endIndex);
                isDeterministic = true;
            }
            else {
                path = this.getImagePath("girl", startIndex, endIndex);
                isDeterministic = false;
            }
            //console.log(path)
            if (path) {
                // Add eternal cache headers for deterministic content
                if (isDeterministic) {
                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Expires': new Date(Date.now() + 31536000000).toUTCString(),
                        'ETag': `"girl-${req.query.seed || req.query.username}"`
                    });
                }
                res.
                    status(200).
                    sendFile(path, { root: '.' });
            }
        };
        //job avatrs
        this.jobsList = process.env.JOBS_LIST ? process.env.JOBS_LIST.split(',') : [];
        this.byJob = (req, res, next) => {
            const job = req.params.job;
            const gender = req.params.gender;
            if (!this.jobsList.includes(job) || !['male', 'female'].includes(gender)) {
                res.
                    status(200).
                    sendFile(this.get404Avatar(), { root: '.' });
                return;
            }
            const path = `${process.env.UPLOAD_DIR}/job/${job}/${gender}${this.foramtFile}`;
            res.
                status(200).
                sendFile(path, { root: '.' });
        };
        //username
        this.checkValidColor = (color) => {
            var regex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            return regex.test(color);
        };
        this.svgAvatar = async (req, res, next) => {
            var _a, _b, _c, _d;
            if ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.referer) {
                console.log("=> Refer:", (_b = req.headers) === null || _b === void 0 ? void 0 : _b.referer);
            }
            const defaultColorArray = [
                {
                    color: '0B60B0',
                    background: '9dc9f2'
                },
                {
                    color: '6C22A6',
                    background: 'd7a3ff'
                },
                {
                    color: 'BF3131',
                    background: 'f09999'
                },
                {
                    color: '508D69',
                    background: 'a1d1b5'
                }
            ];
            let defaultColor = defaultColorArray[Math.floor(Math.random() * 3)];
            let format = 'png';
            let username = [String.fromCharCode(Math.random() * 26 + 65), String.fromCharCode(Math.random() * 26 + 65)]; //Random
            let isDeterministic = false;
            const size = req.query.size ? (Number(req.query.size) > 32 ? (Number(req.query.size) < 1024 ? Number(req.query.size) : 1024) : 32) : 256;
            const uppercase = req.query.uppercase ? (req.query.uppercase == "false" ? false : true) : true;
            const bold = req.query.bold ? (req.query.bold == "false" ? false : true) : true;
            const length = req.query.length ? (Number(req.query.length) > 2 ? 2 : Number(req.query.length)) : 2;
            //Seed or Username (deterministic generation)
            if (req.query.seed) {
                console.log("Seed: ", req.query.seed);
                const seed = req.query.seed.toString();
                const seedHash = this.getDeterministicValue(seed, 1000); // Use larger range for more variety
                // Generate deterministic initials from seed
                const firstChar = String.fromCharCode((seedHash % 26) + 65);
                const secondChar = String.fromCharCode(((seedHash >> 8) % 26) + 65);
                username = [firstChar, secondChar];
                if (username[0].length > 1) {
                    username.push(username[0].charAt(1));
                }
                else {
                    username.push("");
                }
                defaultColor = defaultColorArray[seedHash % 4];
                isDeterministic = true;
            }
            else if (req.query.username) {
                console.log("Username: ", req.query.username);
                username = req.query.username.toString().split(' ');
                if (username[0].length > 1) {
                    username.push(username[0].charAt(1));
                }
                else {
                    username.push("");
                }
                defaultColor = defaultColorArray[req.query.username.toString().length % 4];
                isDeterministic = true;
            }
            //Background
            // @ts-ignore
            let backgroundColor = defaultColor.background;
            if (req.query.background) {
                backgroundColor = this.checkValidColor(req.query.background.toString()) ? req.query.background.toString() : backgroundColor;
            }
            //Color
            // @ts-ignore
            let fontColor = defaultColor.color;
            if (req.query.color) {
                fontColor = this.checkValidColor(req.query.color.toString()) ? req.query.color.toString() : fontColor;
            }
            //Format
            if (req.query.format) {
                format = ['png', 'jpg'].includes(req.query.format.toString()) ? req.query.format.toString() : 'png';
            }
            //Uppercase
            if (uppercase) {
                username.forEach((item, index) => {
                    username[index] = item.toUpperCase();
                });
            }
            else {
                username.forEach((item, index) => {
                    username[index] = item.toLowerCase();
                });
            }
            //length
            if (length == 1) {
                username[1] = "";
            }
            const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 250 250">
                <g id="icon" transform="translate(-177 -243)">
                    <g id="Group_1" data-name="Group 1">
                        <circle id="Ellipse_1" data-name="Ellipse 1" cx="125" cy="125" r="125" transform="translate(177 243)" fill="#${backgroundColor}"/>
                    </g>
                </g>
                <text x="50%" y="54%" fill="#${fontColor}" font-size="110" dominant-baseline="middle" text-anchor="middle">${((_c = username[0]) === null || _c === void 0 ? void 0 : _c.charAt(0)) + ((_d = username[1]) === null || _d === void 0 ? void 0 : _d.charAt(0))}</text> 
            </svg>
        `;
            // Convert SVG to Format
            try {
                const resvg = new Resvg(svgContent, {
                    font: {
                        fontFiles: [`./static/font/${bold ? 'Roboto-Medium.ttf' : 'Roboto-Light.ttf'}`],
                        loadSystemFonts: false,
                    },
                    fitTo: {
                        mode: 'original',
                    },
                });
                const pngData = resvg.render();
                const pngBuffer = pngData.asPng();
                // Add eternal cache headers for deterministic content
                if (isDeterministic) {
                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Expires': new Date(Date.now() + 31536000000).toUTCString(),
                        'ETag': `"svg-${req.query.seed || req.query.username}-${size}-${format}"`
                    });
                }
                if (format === 'jpg') {
                    // Convert PNG to JPEG using sharp
                    const jpegBuffer = await sharp(pngBuffer)
                        .jpeg({ quality: 90 })
                        .toBuffer();
                    res.set('Content-Type', 'image/jpeg');
                    res.send(jpegBuffer);
                }
                else {
                    // Return PNG directly
                    res.set('Content-Type', 'image/png');
                    res.send(pngBuffer);
                }
            }
            catch (error) {
                res.status(500)
                    .sendFile(this.get404Avatar(), { root: '.' });
            }
        };
    }
}
exports.default = new publicController();
