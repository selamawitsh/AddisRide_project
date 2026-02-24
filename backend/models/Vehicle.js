import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'inactive'
    },
    occupancy: {
        type: String,
        enum: ['seats_available', 'standing', 'full'],
        default: 'seats_available'
    }
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', VehicleSchema);
export default Vehicle;


// import mongoose from 'mongoose';

// const VehicleSchema = new mongoose.Schema({
//     plateNumber:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     route:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Route',
//         required:true
//     },
//     status:{
//         type:String,
//         enum:['active','inactive','maintenance'],
//         default:'inactive'
//     },
//     occupancy:{
//         type:String,
//         enum:['seats_available', 'standing', 'full'],
//         default:'seats_available'
//     },
// }
// ,{timestamps:true}
// )


// const Vehicle = mongoose.model('Vehicle', VehicleSchema);

// export default Vehicle;