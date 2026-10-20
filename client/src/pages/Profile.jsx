import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound, MapPin, Package, Pencil, Plus, Star, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { addAddress, deleteAddress, updateAddress, updateProfile } from '../services/userService.js';
import { getErrorMessage } from '../services/api.js';
import { formatDate, getInitials } from '../utils/format.js';
import { rules } from '../utils/validation.js';

const EMPTY_ADDRESS = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };

function applyServerErrors(error, setError) {
  const fields = error.response?.data?.errors;
  if (fields) Object.entries(fields).forEach(([field, message]) => setError(field, { message }));
}

function AccountForm({ user, onSaved }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({ defaultValues: { name: user.name, email: user.email } });

  const onSubmit = async (values) => {
    try {
      const updated = await updateProfile({ name: values.name.trim(), email: values.email.trim() });
      onSaved(updated);
      reset({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    } catch (error) {
      applyServerErrors(error, setError);
      toast.error(getErrorMessage(error, 'Could not update your profile'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <UserRound size={20} className="text-brand-600" /> Account details
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="label">Full name</label>
          <input id="profile-name" className={`input ${errors.name ? 'input-error' : ''}`} {...register('name', rules.name)} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-email" className="label">Email</label>
          <input id="profile-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} {...register('email', rules.email)} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
        {isSubmitting && <Spinner size={16} />} Save changes
      </button>
    </form>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: password }) => {
    try {
      await updateProfile({ currentPassword, newPassword: password });
      reset();
      toast.success('Password changed');
    } catch (error) {
      applyServerErrors(error, setError);
      toast.error(getErrorMessage(error, 'Could not change your password'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <KeyRound size={20} className="text-brand-600" /> Change password
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="currentPassword" className="label">Current password</label>
          <PasswordInput id="currentPassword" autoComplete="current-password" hasError={Boolean(errors.currentPassword)} {...register('currentPassword', { required: 'Enter your current password' })} />
          {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="newPassword" className="label">New password</label>
          <PasswordInput id="newPassword" autoComplete="new-password" hasError={Boolean(errors.newPassword)} {...register('newPassword', rules.newPassword)} />
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="label">Confirm new password</label>
          <PasswordInput
            id="confirmNewPassword"
            autoComplete="new-password"
            hasError={Boolean(errors.confirmPassword)}
            {...register('confirmPassword', { validate: (v) => v === newPassword || 'Passwords do not match' })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
      </div>
      <button type="submit" className="btn-dark" disabled={isSubmitting}>
        {isSubmitting && <Spinner size={16} />} Update password
      </button>
    </form>
  );
}

function AddressForm({ initial, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { ...EMPTY_ADDRESS, ...initial } });

  const submit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
      toast.error(getErrorMessage(error, 'Could not save the address'));
    }
  };

  const field = (name, label, options, props = {}) => (
    <div className={props.className}>
      <label htmlFor={`addr-${name}`} className="label">{label}</label>
      <input id={`addr-${name}`} className={`input ${errors[name] ? 'input-error' : ''}`} {...register(name, options)} {...props.input} />
      {errors[name] && <p className="field-error">{errors[name].message}</p>}
    </div>
  );

  return (
    <form id="address-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
      {field('fullName', 'Full name', { required: 'Full name is required' })}
      {field('phone', 'Phone', { required: 'Phone is required', pattern: { value: /^\+?[0-9\s-]{7,20}$/, message: 'Enter a valid phone number' } }, { input: { type: 'tel' } })}
      {field('line1', 'Address line 1', { required: 'Address is required', minLength: { value: 3, message: 'Address is too short' } }, { className: 'sm:col-span-2' })}
      {field('line2', 'Address line 2 (optional)', {}, { className: 'sm:col-span-2' })}
      {field('city', 'City', { required: 'City is required' })}
      {field('state', 'State', { required: 'State is required' })}
      {field('postalCode', 'Postal code', { required: 'Postal code is required', pattern: { value: /^[A-Za-z0-9\s-]{3,12}$/, message: 'Enter a valid postal code' } })}
      {field('country', 'Country', { required: 'Country is required' })}
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register('isDefault')} /> Make this my default address
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Spinner size={16} />} Save address
        </button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(null); // null | 'new' | address
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const saveAddress = async (values) => {
    const addresses = editing === 'new' ? await addAddress(values) : await updateAddress(editing._id, values);
    updateUser({ ...user, addresses });
    setEditing(null);
    toast.success('Address saved');
  };

  const removeAddress = async () => {
    setDeleting(true);
    try {
      const addresses = await deleteAddress(toDelete._id);
      updateUser({ ...user, addresses });
      toast.success('Address removed');
      setToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account, password and saved addresses." crumbs={[{ label: 'Profile' }]} />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
        <aside className="space-y-4">
          <div className="card flex items-center gap-4 p-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              <p className="text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <Link to="/orders" className="card flex items-center gap-3 p-5 hover:shadow-card-hover">
            <Package size={20} className="text-brand-600" />
            <span className="font-semibold text-slate-900">View my orders</span>
          </Link>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <AccountForm user={user} onSaved={updateUser} />
          <PasswordForm />

          <section className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MapPin size={20} className="text-brand-600" /> Saved addresses
              </h2>
              {user.addresses.length < 5 && (
                <button type="button" className="btn-outline py-2" onClick={() => setEditing('new')}>
                  <Plus size={16} /> Add address
                </button>
              )}
            </div>
            {user.addresses.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No saved addresses yet. They help pre-fill your details at checkout.</p>
            ) : (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {user.addresses.map((address) => (
                  <li key={address._id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">{address.fullName}</p>
                      {address.isDefault && (
                        <span className="badge bg-brand-50 text-brand-700"><Star size={12} /> Default</span>
                      )}
                    </div>
                    <p className="mt-1 text-slate-600">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.postalCode}, {address.country}
                    </p>
                    <p className="text-slate-600">{address.phone}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setEditing(address)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button type="button" className="btn-ghost px-3 py-1.5 text-rose-600" onClick={() => setToDelete(address)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add address' : 'Edit address'} size="lg">
        {editing && <AddressForm initial={editing === 'new' ? {} : editing} onSubmit={saveAddress} onCancel={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove this address?"
        message="This only removes it from your saved addresses."
        confirmLabel="Remove"
        danger
        busy={deleting}
        onConfirm={removeAddress}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
