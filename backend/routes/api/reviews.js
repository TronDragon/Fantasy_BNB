const express = require('express');
const router = express.Router();
const { Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// Get all reviews for a spot by spot ID
router.get('/:spotID', async (req,res) => {
    const { spotId } = req.params;

    const reviews = await Review.findAll({
        where: { spotId },
    });
    return res.json({ reviews })
})

//add a new review for a spot
router.post('/:spotId/add', requireAuth, async (req,res) => {
    const { spotId } = req.params;
    const { userId, rating, content } = req.body;

    const newReview = await Review.create({
        userId,
        spotId,
        rating,
        content,
    });

    return res.json({ review: newReview});
})

//edit a review
router.put('/:reviewId/edit', requireAuth, async (req,res) => {
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
router.delete('/:reviewId/delete', requireAuth, async (req,res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findByPk(reviewId);

    if(!review || review.userId !== userId){
        return res.status(403).json({ message: 'Unauthorized'});
    }
    await review.destroy();

    return res.json({ message: 'Review deleted' });
})



module.exports = router;
