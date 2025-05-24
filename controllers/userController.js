import express from 'express'
import asyncHandler from 'express-async-handler'
import User from './../models/userModel.js';
import generateToken from './../utils/genarateToken.js'
import bcrypt from 'bcryptjs'
import fs from 'fs';
import path from 'path';
import nodeGeocoder from 'node-geocoder'

// @desc    Auth user & token
// @rout    POST /api/users/login
// @access  public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select the password field
  const user = await User.findOne({ email })
  console.log('User from DB:', user); // Debug log

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Debug password comparison
  console.log('Input password:', password);
  console.log('Stored hash:', user.password);
  
  const isMatch = await bcrypt.compare(password,user.password);
  console.log('Password match:', isMatch);

  if (isMatch) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      image: user.image,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register new user
// @rout    POST /api/users/
// @access  public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, address, phonenumber } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }
    let options = {
            provider: 'openstreetmap'
        };
    let geoCoder = nodeGeocoder(options);
    const getCordinates = geoCoder.geocode(address).then(
            response => {
                return response[0]
            }).catch((err) => {
                console.log(err);
            });
    const latAndLong = await getCordinates
    const user = await User.create({
        name,
        email,
        password,
        role,
        address,
        longitude: latAndLong.longitude,
        latitude: latAndLong.latitude,
        phonenumber
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    GET user profile
// @rout    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
  
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            phonenumber: user.phonenumber,
            isAdmin: user.isAdmin,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            passwordChangedAt: user.passwordChangedAt,
        })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    update user profile
// @rout    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    let options = {
            provider: 'openstreetmap'
        };
    let geoCoder = nodeGeocoder(options);
    const getCordinates = geoCoder.geocode(req.body.address).then(
            response => {
                return response[0]
            }).catch((err) => {
                console.log(err);
            });
    const latAndLong = await getCordinates

    // Initialize updates object
    const updates = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      address: req.body.address,
      longitude: latAndLong.longitude,
      latitude: latAndLong.latitude,
      phonenumber: req.body.phonenumber,
    };

    // Update password if it's provided
    if (req.body.password) {
      updates.password = req.body.password;
    }

    // Handle image upload if a file is present in the form data
    if (req.file) {
      // The `req.file.filename` will be available due to the use of multer or other middleware for file upload
      updates.image = `/img/users/${req.file.filename}`;

      // Check if the user already has an image and delete the old image if necessary
      if (req.user.image && req.user.image !== 'default.jpg') {
        const oldImagePath = path.join(process.cwd(), 'public', req.user.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Use findByIdAndUpdate to update the user information
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    // Send response back with updated user data
    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    // Clean up uploaded file if an error occurs
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
});
  

// @desc    GET all users
// @rout    GET /api/users/
// @access  Private/ADMIN
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

// @desc    delete user profile
// @rout    DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        await user.remove()
        res.json({ message: 'User Removed' })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    GET user by id
// @rout    GET /api/users/:id
// @access  Private/ADMIN
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if (user) {
        res.json(user)
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    update user
// @rout    PUT /api/users/
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.role = req.body.role || user.role
        user.isAdmin = req.body.isAdmin

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
        })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

export {
    authUser,
    getUserProfile,
    registerUser,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
}