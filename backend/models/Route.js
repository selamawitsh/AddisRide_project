import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  name:{type:String, required:true},
  lat:{type:Number, required:true},
  lng:{type:Number, required:true},
},
{id:false}
);

const RouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    stops: [StopSchema],

    // Path used to draw the line on the map
    path: [
      {
        lat: Number,
        lng: Number
      }
    ]
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', RouteSchema);

export default Route;