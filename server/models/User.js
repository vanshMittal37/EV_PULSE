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
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'STATION_VENDOR', 'SERVICE_VENDOR', 'HYBRID_VENDOR', 'USER'],
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
