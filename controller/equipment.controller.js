const Equipment = require('../model/equipment.model');
const shortid = require('shortid');
const hbs = require('hbs');

const { validationResult } = require('express-validator');

const cloudinary = require('cloudinary').v2;

hbs.registerHelper('subtract', function (a, b) { return a - b; });

/**
 * Adds a new equipment object and saves it in the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.createEquipment = async function (req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {

        const isNew = await isNewEquipment(req.body.name, req.body.brand, req.body.model);

        if (isNew) {
            let imageURL = null;

            if (req.file != null) {
                const filePath = req.file.path;
                const uploadResult = await cloudinary.uploader.upload(filePath, {allowed_formats: "png"});
                imageURL = uploadResult.url;
            }

            try {
                const equipment = new Equipment({
                    name: req.body.name,
                    brand: req.body.brand,
                    model: req.body.model,
                    quantity: parseInt(req.body.count),
                    imageURL: imageURL
                });

                await equipment.save();
            } catch (err) {
                console.log(err);
            }
        }
    }
    res.redirect("/manage-equipment/");
};

/**
 * Loads and renders the manage equipment page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.viewAllEquipment = async function (req, res) {
    try {
        const equipment = await Equipment.find({});
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

/**
 * Updates an equipment in the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.updateEquipment = async function (req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            let equipment = await Equipment.findById(req.body.equipmentid);
                equipment.name = req.body.name;
                equipment.brand = req.body.brand;
                equipment.model = req.body.model;
                equipment.quantity = req.body.count;

            if (req.file != null) {
                if (equipment.imageURL != null) {
                    const publicID = getPublicIDFromURL(equipment.imageURL);
                    await cloudinary.uploader.destroy(publicID);
                }
                const filePath = req.file.path;
                const uploadResult = await cloudinary.uploader.upload(filePath, {allowed_formats: "png"});
                const imageURL = uploadResult.url;
                equipment.imageURL = imageURL;
            }
            await equipment.save();
        } catch (err) {
            console.log('Error updating db: ' + err);
        }
        res.redirect("/manage-equipment/");
    }
};

/**
 * Deletes an equipment in the database and its image in the Cloudinary storage.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.deleteEquipment = async function (req, res) {
    try {
        let equipment = await Equipment.findById(req.body.equipmentid);
        if (equipment.imageURL != null) {
            const publicID = getPublicIDFromURL(equipment.imageURL);
            await cloudinary.uploader.destroy(publicID);
        }
        await Equipment.findByIdAndDelete(req.body.equipmentid);
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-equipment/");
};

/**
 * AJAX function for retrieving an equipment.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.onrent_get = async function (req, res) {
    try {
        const equipment = await Equipment.findById(req.query.equipmentid);
        if (equipment)
            res.send(equipment);
    } catch (err) {
        console.log(err);
    }
};

/**
 * AJAX function for checking if an equipment already exists
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.check_get = async function (req, res) {
    try {
        const equipmentCount = await Equipment.find({
            _id: {$ne: req.query.eID},
            name: req.query.eName,
            brand: req.query.eBrand,
            model: req.query.eModel
        }).countDocuments();
        res.send({count: equipmentCount});
    }
    catch (err) {
        console.log(err);
    }
};

/**
 * Returns the publicID (filename without file extension) from a URL.
 * @param url - the uniform resource locator of the image stored in Cloudinary storage
 * @returns {string} - the publicID
 */
function getPublicIDFromURL (url) {
    const filenameIndex = url.lastIndexOf('/');
    const filename = url.substring(filenameIndex+1);
    const fileExtensionIndex = filename.lastIndexOf('.');
    return filename.substring(0, fileExtensionIndex);
}

exports.getPublicIDFromURL = getPublicIDFromURL;

/**
 * Checks if a to-be-created equipment exists already in the database
 * such that it has the same name, brand, and model as the already existing equipment.
 * @param equipment - the equipment to be created
 * @returns {boolean} - false if the equipment matches an equipment with the
 * same name, brand, and model; true otherwise
 */
async function isNewEquipment (eName, eBrand, eModel) {
    let equipmentCount;
    try {
        equipmentCount = await Equipment.find({
            name: eName,
            brand: eBrand,
            model: eModel
        }).countDocuments();
    }
    catch (err) {
        console.log(err);
    }
    return equipmentCount === 0;
}