import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../services/api.js';
import { rules } from '../utils/validation.js';

function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return { label: 'Weak', width: '33%', color: 'bg-rose-500' };
  if (score <= 3) return { label: 'Good', width: '66%', color: 'bg-amber-500' };
  return { label: 'Strong', width: '100%', color: 'bg-emerald-500' };
}

export default function Register() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false } });

  const password = watch('password');
  const strength = passwordStrength(password);
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/';

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await registerAccount({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`Welcome to WIZHEX, ${user.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="It only takes a minute. No credit card required.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            className={`input ${errors.name ? 'input-error' : ''}`}
            {...register('name', {
              ...rules.name,
              validate: (v) => v.trim().length >= 2 || 'Name must be at least 2 characters',
            })}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={`input ${errors.email ? 'input-error' : ''}`}
            {...register('email', rules.email)}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={Boolean(errors.password)}
            hasError={Boolean(errors.password)}
            {...register('password', rules.newPassword)}
          />
          {password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <span className="text-xs font-medium text-slate-500">{strength.label}</span>
            </div>
          )}
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            hasError={Boolean(errors.confirmPassword)}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
              {...register('terms', { required: 'Please accept the terms to continue' })}
            />
            <span>
              I agree to the Terms of Service and Privacy Policy. WIZHEX is a portfolio demo: no real orders are
              fulfilled.
            </span>
          </label>
          {errors.terms && <p className="field-error">{errors.terms.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
          {isSubmitting ? <Spinner size={18} /> : <UserPlus size={18} />}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
