const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
    myFile: {
        type : String,
        required: true
    },
    fileLink: {
        type: String
    }
});

module.exports = Images = mongoose.model('imagecollections', imageSchema);


// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// Create Schema
// const DoctorSchema = new Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   department: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// });
// module.exports = Doctor = mongoose.model('e-health-doctors', DoctorSchema);