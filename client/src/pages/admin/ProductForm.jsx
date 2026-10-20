import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner.jsx';
import { getErrorMessage } from '../../services/api.js';

const toLines = (arr = []) => arr.join('\n');
const specsToText = (specs = []) => specs.map((s) => `${s.label}: ${s.value}`).join('\n');

function parseSpecs(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(':');
      return index === -1 ? null : { label: line.slice(0, index).trim(), value: line.slice(index + 1).trim() };
    })
    .filter((s) => s && s.label && s.value);
}

/** Add / edit form for a game-account listing. */
export default function ProductForm({ product, categories, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      category: product?.category?._id || categories[0]?._id || '',
      price: product?.price ?? '',
      originalPrice: product?.originalPrice ?? '',
      stock: product?.stock ?? 1,
      description: product?.description || '',
      images: toLines(product?.images),
      specifications: specsToText(product?.specifications),
      featured: product?.featured || false,
      isActive: product ? product.isActive !== false : true,
    },
  });
  const price = watch('price');

  const submit = async (values) => {
    const payload = {
      name: values.name.trim(),
      category: values.category,
      brand: categories.find((c) => c._id === values.category)?.name || '',
      price: Number(values.price),
      originalPrice: values.originalPrice === '' ? null : Number(values.originalPrice),
      stock: Number(values.stock),
      description: values.description.trim(),
      images: values.images.split('\n').map((s) => s.trim()).filter(Boolean),
      specifications: parseSpecs(values.specifications),
      featured: values.featured,
      isActive: values.isActive,
    };
    try {
      await onSubmit(payload);
    } catch (error) {
      const fields = error.response?.data?.errors;
      if (fields) Object.entries(fields).forEach(([field, message]) => setError(field.split('.')[0], { message }));
      toast.error(getErrorMessage(error, 'Could not save the listing'));
    }
  };

  const err = (name) => errors[name] && <p className="field-error">{errors[name].message}</p>;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="p-name" className="label">Listing title</label>
        <input id="p-name" className={`input ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' }, maxLength: { value: 140, message: 'At most 140 characters' } })} />
        {err('name')}
      </div>
      <div>
        <label htmlFor="p-category" className="label">Game</label>
        <select id="p-category" className="input" {...register('category', { required: 'Choose a game' })}>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {err('category')}
      </div>
      <div>
        <label htmlFor="p-stock" className="label">Stock (accounts available)</label>
        <input id="p-stock" type="number" min="0" className={`input ${errors.stock ? 'input-error' : ''}`} {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Cannot be negative' }, validate: (v) => Number.isInteger(Number(v)) || 'Whole numbers only' })} />
        {err('stock')}
      </div>
      <div>
        <label htmlFor="p-price" className="label">Price (USD)</label>
        <input id="p-price" type="number" min="0" step="0.01" className={`input ${errors.price ? 'input-error' : ''}`} {...register('price', { required: 'Price is required', min: { value: 0, message: 'Cannot be negative' } })} />
        {err('price')}
      </div>
      <div>
        <label htmlFor="p-original" className="label">Original price (optional)</label>
        <input
          id="p-original"
          type="number"
          min="0"
          step="0.01"
          className={`input ${errors.originalPrice ? 'input-error' : ''}`}
          {...register('originalPrice', { validate: (v) => v === '' || Number(v) >= Number(price) || 'Must be at least the price' })}
        />
        {err('originalPrice')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-description" className="label">Description</label>
        <textarea id="p-description" rows={4} className={`input resize-y ${errors.description ? 'input-error' : ''}`} {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })} />
        {err('description')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-images" className="label">Image URLs or paths (one per line)</label>
        <textarea id="p-images" rows={3} placeholder="/images/coc/my-screenshot.png" className="input resize-y font-mono text-xs" {...register('images')} />
        {err('images')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-specs" className="label">Specifications (one "Label: Value" per line)</label>
        <textarea id="p-specs" rows={4} placeholder={'Town Hall: TH16\nLogin: Supercell ID transfer'} className="input resize-y font-mono text-xs" {...register('specifications')} />
        {err('specifications')}
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register('featured')} /> Featured on the home page
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register('isActive')} /> Visible in the store
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Spinner size={16} />} {product ? 'Save changes' : 'Create listing'}
        </button>
      </div>
    </form>
  );
}
