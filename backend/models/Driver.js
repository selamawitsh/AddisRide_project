import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
    },
    vehicle:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
    },
    isVerified:{
        type:Boolean,
        default:false
    },
},
{timestamps:true}
);

const Driver = mongoose.model('Driver', DriverSchema);

export default Driver;