const Equipment = require('../model/equipment.model');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const hbs = require('hbs');

const { validationResult } = require('express-validator');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const S3_FILE_URL = 'https://pahiram-services-bucket.s3.us-east-2.amazonaws.com/equipment-uploads/';

const BUCKET_NAME = 'pahiram-services-bucket';

hbs.registerHelper('subtract', function (a, b) { return a - b; });

exports.createEquipment = async function (req, res) {

    var errors = validationResult(req);

    if (errors.isEmpty()) {
        var sameEquipCt = await Equipment.countDocuments(
            { name: req.body.name });
        if (sameEquipCt == 0) {
            const tempPath = req.file.path;
            const filename = shortid.generate() + '.png';
            // const filePath = path.join(__dirname, '/../public/uploads/equipment-images', filename);
            // const relativeFilePath = '/uploads/equipment-images/' + filename;

            uploadToS3(filename, tempPath);
            var imageURL = S3_FILE_URL + filename;
            
            try {
                let equipment = new Equipment({
                    name: req.body.name,
                    quantity: parseInt(req.body.count),
                    imageURL: imageURL
                });

                await equipment.save();
            } catch (err) {
                console.log(err);
            }

            /* fs.rename(tempPath, filePath, async function (err) {
                if (err) {
                    console.log(err);
                } else {
                    uploadToS3(filename, filePath);
                    var imageURL = S3_FILE_URL + filename;

                    console.log(imageURL);

                    let equipment = new Equipment({
                        name: req.body.name,
                        quantity: parseInt(req.body.count),
                        imageURL: imageURL
                    });

                    try {
                        await equipment.save();
                    } catch (err) {
                        console.log(err);
                    }
                }
            }); */
        }
        res.redirect("/manage-equipment/");
    }
};

exports.viewAllEquipment = async function (req, res) {
    try {
        equipment = await Equipment.find({});

        res.render('manage-equipment-page', {
            active: { active_manage_equipment: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            equipmentList: equipment
        });
    } catch (err) {
        console.log(err);
    }
};

exports.updateEquipment = async function (req, res) {

    var errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            var equipment = await Equipment.findById(req.body.equipmentid);
            if (req.body.name.trim().length != 0) { equipment.name = req.body.name; }
            if (!isNaN(parseInt(req.body.count))) { equipment.quantity = req.body.count; }
            if (req.file != null) {  
                const oldFilenameIndex = equipment.imageURL.lastIndexOf('/');
                const oldFilename = equipment.imageURL.substring(oldFilenameIndex+1);
                const tempPath = req.file.path;
                const newFilename = shortid.generate() + '.png';
                console.log('old: ' + oldFilename);
                console.log('new: ' + newFilename);
                
                deleteFromS3(oldFilename)

                uploadToS3(newFilename, tempPath);                
                equipment.imageURL = S3_FILE_URL + newFilename;

                console.log(equipment.imageURL);
            }
            await equipment.save();
        } catch (err) {
            console.log('Error updating db: ' + err);
        }
        res.redirect("/manage-equipment/");
    }
};

exports.deleteEquipment = async function (req, res) {
    try {
        var equipment = await Equipment.findById(req.body.equipmentid);
        // if (fs.existsSync(path.join(__dirname, '/../public', equipment.imageURL)))
        //     fs.unlinkSync(path.join(__dirname, '/../public', equipment.imageURL));

        const filenameIndex = equipment.imageURL.lastIndexOf('/');
        const filename = equipment.imageURL.substring(filenameIndex+1);
        console.log('Deleting ' + filename);
        deleteFromS3(filename);

        await Equipment.findByIdAndDelete(req.body.equipmentid);
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-equipment/");
};

exports.onrent_get = async function (req, res) {
    try {
        var equipment = await Equipment.findById(req.query.equipmentid);
        if (equipment)
            res.send(equipment);
    } catch (err) {
        console.log(err);
    }
};

var deleteFromS3 = (filename) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'equipment-uploads/' + filename
    }

    s3.deleteObject(params, (err, data) => {
        if (err) console.log(err);
        else console.log(data);
    })
}

var uploadToS3 = (newFilename, filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        
        const params = {
            Bucket: BUCKET_NAME,
            Key: 'equipment-uploads/' + newFilename,
            Body: fileContent 
        }
    
        s3.upload(params, (err, data) => {
            if (err) console.log(err);
            else console.log(data);
        });
    } catch (error) {
        console.log(error);
    }
}