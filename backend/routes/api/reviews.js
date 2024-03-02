const express = require('express');
const router = express.Router();
const { Review, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

//Get all reviews of the current user
router.get('/reviews/current', async (req,res) => {
    const { userId } = req.user;

    const reviews = await Review.findAll({
        where: { userId },
        include: [
            { model: Spot },
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
            { model: ReviewImage, as: 'ReviewImages' },
        ],
    });
    return res.status(200).json({ Reviews: reviews });
});

// Get all reviews for a spot by spot ID
router.get('/spots/:spotId/reviews', async (req,res) => {
    const { spotId } = req.params;

    const reviews = await Review.findAll({
        where: { spotId },
    });
    return res.json({ reviews })
})

//add a new review for a spot
router.post('/spots/:spotId/reviews', requireAuth, async (req,res) => {
    const { spotId } = req.params;
    const { userId, review, rating  } = req.body;

    // check to see if a review exists for this user
    const existingReview = await Review.findOne({
        where: { userId, spotId },
    })
    //if review exists, stop user from posting another one
    if(existingReview){
        return res.status(500).json({ message: 'User already has a review for this spot' })
    }

    const newReview = await Review.create({
        userId,
        spotId,
        review,
        rating,
    });

    return res.status(201).json({ id: newReview.id, userId, spotId, review, rating,
        createdAt: newReview.createdAt, updatedAt: newReview.updatedAt });
})

//add an image to a review based on the review's id
router.post('/reviews/:reviewID/images', requireAuth, async (req,res) => {
    const { reviewId } = req.params;
    const { userId, url } = req.body;

    const review = await Review.findByPk(reviewId);

    //check to see is user is allowed to post
    if(!review || review.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    const reviewImageCount = await ReviewImage.count({
        where: { reviewId },
    });

    //check to see if user is posting within the allowed number of images
    if(reviewImageCount >= 10){
        return res.status(403).json({ message: 'Maximum number of images for this resource was reached'});
    };
    const newReviewImage = await ReviewImage.create({
        reviewId,
        url,
    })
    return res.json({ id: newReviewImage.id, url });
})

//edit a review
router.put('/reviews/:reviewId', requireAuth, async (req,res) => {
    const { reviewId } = req.params;
    const { userId, rating, content } = req.body;

    const review = await Review.findByPk(reviewId);
    if(!review || review.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    //update time
    review.rating = rating;
    review.content = content;
    await review.save();

    return res.json({ review });
})

//delete a review
router.delete('/reviews/:reviewId', requireAuth, async (req,res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findByPk(reviewId);

    if(!review || review.userId !== userId){
        return res.status(403).json({ message: 'Unauthorized'});
    }
    await review.destroy();

    return res.json({ message: 'Successfully deleted' });
})

//delete a review image
router.delete('/review-images/:imageId', requireAuth, async (req,res) => {
    const { imageId } = req.params;
    const { userId } = req.user;

    const reviewImage = await SpotImage.findByPk(imageId, {
        include: {
            model: Review,
            where: { userId }
        }
    })

    if(!reviewImage){
        return res.status(404).json({ message: "Review Image couldn't be found" })
    }
    //delete the image
    await reviewImage.destroy();
    return res.json({ message: "Successfully deleted" })
})

module.exports = router;
