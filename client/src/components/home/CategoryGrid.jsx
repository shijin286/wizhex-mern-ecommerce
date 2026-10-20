import SectionHeader from '../SectionHeader.jsx';
import CategoryCard from '../CategoryCard.jsx';
import ErrorState from '../ErrorState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { fetchCategories } from '../../services/productService.js';

export default function CategoryGrid() {
  const { data: categories, loading, error, reload } = useFetch(fetchCategories, []);

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeader
          eyebrow="Pick your game"
          title="Shop by Game"
          subtitle="Clash of Clans, PUBG Mobile, eFootball and Call of Duty accounts, all hand-checked."
          linkTo="/categories"
          linkLabel="All games"
        />

        {error ? (
          <ErrorState title="Couldn't load games" message={error} onRetry={reload} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />)
              : categories.slice(0, 4).map((category, index) => (
                  <CategoryCard key={category._id} category={category} index={index} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
