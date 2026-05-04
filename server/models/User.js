const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    documents: [
      {
        name: String,
        url: String,
      }
    ],
    // ── Station fields (1:1 with Vendor) ──────────────────────────────
    // For STATION_VENDOR and HYBRID_VENDOR roles, each vendor IS one station.
    // businessName is used as the station name.
    numberOfPorts: {
      type: Number,
      default: 2,
      min: 1,
    },
    portTypes: {
      type: [String],  // e.g. ['CCS2', 'Type 2']
      default: ['Type 2'],
    },
    stationStatus: {
      type: String,
      enum: ['Active', 'Offline', 'Maintenance'],
      default: 'Offline', // Goes Active only when vendor is ACTIVE
    },
    locationCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    // ─────────────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'STATION_VENDOR', 'SERVICE_VENDOR', 'HYBRID_VENDOR', 'USER', 'TECHNICIAN'],
        message: '{VALUE} is not a valid role',
      },
      default: 'USER',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
        message: '{VALUE} is not a valid status',
      },
      default: 'PENDING',
    },
    // Technician-specific fields
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    specialization: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    is24x7: {
      type: Boolean,
      default: true,
    },
    schedule: {
      type: Map,
      of: {
        open: String,
        close: String
      },
      default: {}
    },
    stationImages: {
      type: [String],
      default: [],
    },
    taxId: {
      type: String,
      trim: true,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolder: String,
    },
    techLevel: {
      type: String,
      enum: ['Junior', 'Senior'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
