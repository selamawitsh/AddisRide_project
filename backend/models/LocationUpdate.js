import mongoose from 'mongoose';

const LocationUpdateSchema = new mongoose.Schema({
    vehicle:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required:true
    },
    lat:{
        type:Number,
        required:true
    },
    lng:{
        type:Number,
        required:true
    },
},
{timestamps:true}
);

const LocationUpdate = mongoose.model('LocationUpdate', LocationUpdateSchema);

export default LocationUpdate;