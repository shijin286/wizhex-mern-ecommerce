import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MessageSquare, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import RatingStars from './RatingStars.jsx';
import Spinner from './Spinner.jsx';
import ErrorState from './ErrorState.jsx';
import useFetch from '../hooks/useFetch.js';
import { useAuth } from '../hooks/useAuth.js';
import { createReview, fetchReviews } from '../services/productService.js';
import { getErrorMessage } from '../services/api.js';
import { formatDate, getInitials } from '../utils/format.js';

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Star
            size={26}
            className={(hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBreakdown({ reviews, rating, reviewCount }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = reviews.length || 1;

  return (
    <div className="card p-6">
      <p className="font-display text-5xl font-extrabold text-slate-900">{Number(rating || 0).toFixed(1)}</p>
      <div className="mt-2">
        <RatingStars rating={rating} size={18} />
      </div>
      <p className="mt-1 text-sm text-slate-500">Based on {reviewCount} reviews</p>
      <div className="mt-5 space-y-2">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-slate-600">{star}</span>
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-slate-500">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductReviews({ product, onReviewAdded }) {
  const { user } = useAuth();
  const location = useLocation();
  const { data: reviews, loading, error, reload, setData } = useFetch(() => fetchReviews(product._id), [product._id]);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { comment: '' } });

  const alreadyReviewed = Boolean(user && reviews?.some((r) => r.user?._id === user._id));

  const onSubmit = async ({ comment }) => {
    if (!rating) {
      setRatingError('Please choose a rating');
      return;
    }
    setRatingError('');
    try {
      const review = await createReview(product._id, { rating, comment: comment.trim() });
      setData([{ ...review, user: { _id: user._id, name: user.name } }, ...(reviews || [])]);
      reset();
      setRating(0);
      toast.success('Thanks for your review!');
      onReviewAdded?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not submit your review'));
    }
  };

  if (error) return <ErrorState title="Couldn't load reviews" message={error} onRetry={reload} />;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6">
        <RatingBreakdown reviews={reviews || []} rating={product.rating} reviewCount={product.reviewCount} />

        <div className="card p-6">
          <h3 className="text-lg font-bold">Write a review</h3>
          {!user ? (
            <p className="mt-2 text-sm text-slate-600">
              <Link to="/login" state={{ from: { pathname: location.pathname } }} className="font-semibold text-brand-600 hover:underline">
                Log in
              </Link>{' '}
              to share your thoughts on this product.
            </p>
          ) : alreadyReviewed ? (
            <p className="mt-2 text-sm text-slate-600">You have already reviewed this product. Thank you!</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
              <div>
                <span className="label">Your rating</span>
                <StarInput value={rating} onChange={(v) => { setRating(v); setRatingError(''); }} />
                {ratingError && <p className="field-error">{ratingError}</p>}
              </div>
              <div>
                <label htmlFor="review-comment" className="label">
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  placeholder="What did you like or dislike?"
                  className={`input resize-none ${errors.comment ? 'input-error' : ''}`}
                  {...register('comment', {
                    required: 'Please write a short review',
                    minLength: { value: 10, message: 'Review must be at least 10 characters' },
                    maxLength: { value: 1000, message: 'Review must be under 1000 characters' },
                  })}
                />
                {errors.comment && <p className="field-error">{errors.comment.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting && <Spinner size={16} />} Submit review
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="card space-y-3 p-5">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-1/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <MessageSquare size={32} className="text-slate-300" />
            <p className="mt-3 font-semibold text-slate-900">No reviews yet</p>
            <p className="mt-1 text-sm text-slate-500">Be the first to review this product.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review._id} className="card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {getInitials(review.user?.name || 'Customer')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{review.user?.name || 'Customer'}</p>
                      <time className="text-xs text-slate-400" dateTime={review.createdAt}>
                        {formatDate(review.createdAt)}
                      </time>
                    </div>
                    <div className="mt-1">
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
