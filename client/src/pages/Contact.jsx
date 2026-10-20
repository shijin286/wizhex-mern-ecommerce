import { useForm } from 'react-hook-form';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import { sendContactMessage } from '../services/miscService.js';
import { getErrorMessage } from '../services/api.js';
import { rules } from '../utils/validation.js';
import { SUPPORT } from '../utils/constants.js';

const CONTACT_CARDS = [
  { icon: Phone, title: 'Call us', value: SUPPORT.phone, href: `tel:${SUPPORT.phone.replace(/\s/g, '')}` },
  { icon: Mail, title: 'Email us', value: SUPPORT.email, href: `mailto:${SUPPORT.email}` },
  { icon: Clock, title: 'Support hours', value: SUPPORT.hours },
  { icon: MapPin, title: 'Visit us', value: SUPPORT.address },
];

const SUBJECTS = ['Order enquiry', 'Returns & refunds', 'Product question', 'Partnership', 'Other'];

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', subject: SUBJECTS[0], message: '' } });

  const onSubmit = async (values) => {
    try {
      const message = await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject,
        message: values.message.trim(),
      });
      toast.success(message || 'Thanks! We will get back to you within 24 hours.');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send your message'));
    }
  };

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Questions about an order or a product? Our support team is happy to help."
        crumbs={[{ label: 'Contact' }]}
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-5 lg:py-14">
        <div className="space-y-4 lg:col-span-2">
          {CONTACT_CARDS.map(({ icon: Icon, title, value, href }) => (
            <div key={title} className="card flex items-start gap-4 p-5">
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                {href ? (
                  <a href={href} className="break-all text-sm text-slate-600 hover:text-brand-600">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-slate-600">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6 sm:p-8 lg:col-span-3">
          <h2 className="text-xl font-bold">Send us a message</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="label">
                Name
              </label>
              <input
                id="contact-name"
                autoComplete="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', rules.name)}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="label">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', rules.email)}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="label">
              Subject
            </label>
            <select id="contact-subject" className="input" {...register('subject', { required: true })}>
              {SUBJECTS.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact-message" className="label">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={6}
              className={`input resize-none ${errors.message ? 'input-error' : ''}`}
              placeholder="How can we help?"
              {...register('message', {
                required: 'Please enter a message',
                minLength: { value: 10, message: 'Message must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Message must be under 2000 characters' },
              })}
            />
            {errors.message && <p className="field-error">{errors.message.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 sm:w-auto sm:px-8">
            {isSubmitting ? <Spinner size={16} /> : <Send size={16} />}
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </>
  );
}
