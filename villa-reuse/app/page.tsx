
const categories = [
  { icon: "♧", name: "Household", count: "Everyday essentials" },
  { icon: "▤", name: "Books & School", count: "Learn and share" },
  { icon: "♧", name: "Clothing", count: "Wear it again" },
  { icon: "⌂", name: "Furniture", count: "Give it a new home" },
  { icon: "⌁", name: "Electronics", count: "Useful tech" },
  { icon: "＋", name: "Others", count: "More to discover" },
];

const featuredItems = [
  {
    name: "A little collection of good reads",
    category: "Books & School",
    type: "DONATION",
    condition: "Good condition",
    emoji: "📚",
    bg: "item-books",
  },
  {
    name: "Wooden bedside table",
    category: "Furniture",
    type: "EXCHANGE",
    condition: "Well maintained",
    emoji: "🪑",
    bg: "item-furniture",
  },
  {
    name: "Everyday tote bag",
    category: "Clothing",
    type: "DONATION",
    condition: "Like new",
    emoji: "👜",
    bg: "item-bag",
  },
  {
    name: "Kitchen essentials set",
    category: "Household",
    type: "EXCHANGE",
    condition: "Good condition",
    emoji: "🍵",
    bg: "item-home",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">↻</span>
          <span>villa<span className="brand-light">reuse</span></span>
        </a>

        <div className="nav-links">
          <a href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="nav-actions">
          <a href="/login" className="login-link">Log in</a>
          <a href="/register" className="nav-button">Join our community ↗</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            A COMMUNITY THAT SHARES
          </div>

          <h1>
            Give things a second life.
            <br />
            <span>Make someone’s day.</span>
          </h1>

          <p className="hero-description">
            Your unused things could be someone else’s treasure.
            Share, exchange, and give items a new home in your community.
          </p>

          <div className="hero-buttons">
            <a href="#discover" className="primary-button">
              Explore items <span>↗</span>
            </a>
            <a href="/register" className="secondary-button">
              Share an item
            </a>
          </div>

          <div className="hero-note">
            <span className="note-icon">♡</span>
            Small acts of sharing make a big difference.
          </div>
        </div>

        <div className="hero-art">
          <div className="art-circle circle-back" />
          <div className="art-circle circle-front" />
          <div className="floating-card card-top">
            <span className="floating-icon">♻</span>
            <div>
              <strong>Reuse, not waste</strong>
              <small>Give items another chance</small>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-sun" />
            <div className="plant plant-left">🌿</div>
            <div className="donation-box">
              <span className="box-heart">♡</span>
              <span className="box-label">SHARE<br />SOMETHING</span>
            </div>
            <div className="plant plant-right">🪴</div>
            <div className="book-stack">
              <div className="book book-one">A BETTER<br />TOMORROW</div>
              <div className="book book-two">SHARE MORE</div>
              <div className="book book-three" />
            </div>
          </div>
          <div className="floating-card card-bottom">
            <div className="avatar-stack">
              <span>🌻</span>
              <span>🍃</span>
              <span>♡</span>
            </div>
            <div>
              <strong>Good things are shared</strong>
              <small>Community · Kindness · Reuse</small>
            </div>
          </div>
        </div>
      </section>

      <section className="category-section" id="discover">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLORE THE COMMUNITY</div>
            <h2>Find something useful.</h2>
            <p>Discover items waiting for a new home.</p>
          </div>
          <a href="/items" className="text-link">Browse all items ↗</a>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <a href="/items" className="category-card" key={category.name}>
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-count">{category.count}</div>
              <span className="category-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">GIVE ITEMS A NEW HOME</div>
            <h2>Recently shared.</h2>
            <p>Good finds from people in your community.</p>
          </div>
          <a href="/items" className="text-link">See everything ↗</a>
        </div>

        <div className="items-grid">
          {featuredItems.map((item) => (
            <a href="/items" className="item-card" key={item.name}>
              <div className={`item-image ${item.bg}`}>
                <span className="item-emoji">{item.emoji}</span>
                <span className={`item-badge ${item.type === "DONATION" ? "donation-badge" : "exchange-badge"}`}>
                  {item.type}
                </span>
                <span className="item-heart">♡</span>
              </div>
              <div className="item-info">
                <span className="item-category">{item.category}</span>
                <h3>{item.name}</h3>
                <span className="item-condition">{item.condition}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-header">
          <div className="eyebrow">A SIMPLE WAY TO SHARE</div>
          <h2>Good things happen<br />when we share.</h2>
          <p>Three little steps to make a difference.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon">📦</div>
            <h3>Share what you have</h3>
            <p>Post things you no longer need. Add a photo, description, and condition.</p>
          </div>
          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon">♡</div>
            <h3>Find something you need</h3>
            <p>Browse available items and request a donation or exchange that works for you.</p>
          </div>
          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon">♻</div>
            <h3>Give it a new home</h3>
            <p>Connect with your community and keep useful things from going to waste.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <div className="eyebrow cta-eyebrow">BE PART OF SOMETHING GOOD</div>
          <h2>One small share.<br />One big difference.</h2>
          <p>Join a community that believes good things deserve another chance.</p>
          <a href="/register" className="cta-button">Join VILLA-REUSE ↗</a>
        </div>
        <div className="cta-decoration">♻</div>
      </section>

      <footer className="footer">
        <a href="#" className="brand footer-brand">
          <span className="brand-icon">↻</span>
          <span>villa<span className="brand-light">reuse</span></span>
        </a>
        <p>Reuse more. Waste less. Share better.</p>
        <span className="footer-copy">© 2026 VILLA-REUSE · Made for the community ♡</span>
      </footer>
    </main>
  );
}
