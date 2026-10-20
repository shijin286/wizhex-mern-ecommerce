import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorState from '../../components/ErrorState.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Spinner from '../../components/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import { createCategory, deleteCategory, updateCategory } from '../../services/adminService.js';
import { fetchCategories } from '../../services/productService.js';
import { getErrorMessage } from '../../services/api.js';
import { handleImageError } from '../../utils/format.js';
import { PLACEHOLDER_IMAGE } from '../../utils/constants.js';

function CategoryForm({ category, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: category?.name || '', description: category?.description || '', image: category?.image || '' },
  });

  const submit = async (values) => {
    try {
      await onSubmit({ name: values.name.trim(), description: values.description.trim(), image: values.image.trim() });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save the game'));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="c-name" className="label">Game name</label>
        <input id="c-name" className={`input ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="c-description" className="label">Description</label>
        <textarea id="c-description" rows={3} className="input resize-none" {...register('description', { maxLength: { value: 300, message: 'At most 300 characters' } })} />
        {errors.description && <p className="field-error">{errors.description.message}</p>}
      </div>
      <div>
        <label htmlFor="c-image" className="label">Cover image URL or path</label>
        <input id="c-image" placeholder="/images/coc/coc-cover.png" className="input font-mono text-xs" {...register('image')} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Spinner size={16} />} Save
        </button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const { data: categories, loading, error, reload } = useFetch(fetchCategories, []);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const save = async (payload) => {
    if (editing === 'new') await createCategory(payload);
    else await updateCategory(editing._id, payload);
    toast.success('Game saved');
    setEditing(null);
    reload();
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteCategory(toDelete._id);
      toast.success('Game deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState title="Couldn't load games" message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus size={18} /> Add game
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)
          : categories.map((category) => (
              <div key={category._id} className="card overflow-hidden">
                <img src={category.image || PLACEHOLDER_IMAGE} alt="" onError={handleImageError} className="aspect-[4/3] w-full object-cover" />
                <div className="p-4">
                  <p className="font-bold text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.productCount} active listing(s) · /{category.slug}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{category.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn-outline px-3 py-1.5" onClick={() => setEditing(category)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" className="btn-ghost px-3 py-1.5 text-rose-600" onClick={() => setToDelete(category)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add game' : 'Edit game'}>
        {editing && <CategoryForm category={editing === 'new' ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this game?"
        message={`"${toDelete?.name}" can only be deleted once it has no active listings.`}
        confirmLabel="Delete game"
        danger
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
