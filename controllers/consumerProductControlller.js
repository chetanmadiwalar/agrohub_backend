import asyncHandler from 'express-async-handler';
import ConsumerProducts from './../models/consumerProductModel.js';

// @desc    Fetch all products
// @route   GET /consumer
// @access  Public
const getConsumerProducts = asyncHandler(async (req, res) => {
    const consumerProducts = await ConsumerProducts.find({});
    res.json(consumerProducts);
});

// @desc    Fetch Consumer Product by ID
// @route   GET /consumer/:id
// @access  Public
const getConsumerProductById = asyncHandler(async (req, res) => {
    const consumerProduct = await ConsumerProducts.findById(req.params.id);

    if (consumerProduct) {
        res.json(consumerProduct);
    } else {
        res.status(404);
        throw new Error('Consumer Product not Found');
    }
});

// @desc    Delete consumer product
// @route   DELETE /consumer/:id
// @access  Private/Admin
const deleteConsumerProduct = asyncHandler(async (req, res) => {
    const consumerProduct = await ConsumerProducts.findById(req.params.id);

    if (consumerProduct) {
        await consumerProduct.remove();
        res.json({ message: 'Consumer product removed' });
    } else {
        res.status(404);
        throw new Error('Consumer Product not Found');
    }
});

// @desc    Create Consumer Product
// @route   POST /consumer
// @access  Private/Admin
const createConsumer = asyncHandler(async (req, res) => {
    const consumerProduct = new ConsumerProducts({
        prod_name: 'Sample name',
        user: req.user._id,
        seller_name: 'Sample seller',
        image: '/images/consumer/sample.jpg',
        price: 0,
        prod_size: '0kg',
        quantity: 0,
        avalaible_location: 'Sample location',
    });

    const createdConsumerProduct = await consumerProduct.save();
    res.status(201).json(createdConsumerProduct);
});

// @desc    Update Consumer Product
// @route   PUT /consumer/:id
// @access  Private/Admin
const updateConsumer = asyncHandler(async (req, res) => {
    const { prod_name, price, image, seller_name, prod_size, quantity, avalaible_location } = req.body;

    const consumerProduct = await ConsumerProducts.findById(req.params.id);

    if (consumerProduct) {
        consumerProduct.prod_name = prod_name;
        consumerProduct.price = price;
        consumerProduct.image = image || consumerProduct.image; // Ensure image doesn't become empty
        consumerProduct.seller_name = seller_name;
        consumerProduct.prod_size = prod_size;
        consumerProduct.quantity = quantity;
        consumerProduct.avalaible_location = avalaible_location;

        const updatedConsumer = await consumerProduct.save();
        res.status(200).json(updatedConsumer);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


const createConsumerProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    // Check if user is authenticated
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not logged in');
    }

    const consumerProduct = await ConsumerProducts.findById(req.params.id);
    
    if (!consumerProduct) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = consumerProduct.reviews.find(
        r => r.user && r.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    // Create new review
    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id
    };

    // Add review to product
    consumerProduct.reviews.push(review);

    // Update number of reviews and average rating
    consumerProduct.numReviews = consumerProduct.reviews.length;
    consumerProduct.rating = 
        consumerProduct.reviews.reduce((acc, item) => item.rating + acc, 0) / 
        consumerProduct.reviews.length;

    // Save the updated product
    await consumerProduct.save();
    
    res.status(201).json({ message: 'Review added successfully' });
});


export {
    getConsumerProducts,
    getConsumerProductById,
    deleteConsumerProduct,
    createConsumer,
    updateConsumer,
    createConsumerProductReview,
};
