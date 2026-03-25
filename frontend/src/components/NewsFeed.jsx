import { useState, useEffect } from 'react';

const RSS_API =
  'https://api.rss2json.com/v1/api.json?rss_url=https://news.ycombinator.com/rss';

function stripHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function formatPublishedDate(pubDate) {
  if (!pubDate) return '—';
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const REFRESH_INTERVAL_SEC = 60;

export default function NewsFeed({ onCountdownChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let secondsLeft = REFRESH_INTERVAL_SEC;

    async function fetchNews(isInitial) {
      try {
        if (isInitial) setLoading(true);
        setError(null);
        const res = await fetch(RSS_API);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (data.status !== 'ok') {
          throw new Error(data.message || 'Feed could not be loaded');
        }
        const list = (data.items || []).slice(0, 20);
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load news');
        }
      } finally {
        if (!cancelled && isInitial) setLoading(false);
      }
    }

    function reportCountdown(s) {
      if (!cancelled) onCountdownChange?.(s);
    }

    reportCountdown(secondsLeft);
    fetchNews(true);

    const tick = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        fetchNews(false);
        secondsLeft = REFRESH_INTERVAL_SEC;
      }
      reportCountdown(secondsLeft);
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [onCountdownChange]);

  if (loading) {
    return (
      <p className="muted news-feed__status" aria-live="polite">
        Loading…
      </p>
    );
  }

  if (error && items.length === 0) {
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="news-feed">
      {error && items.length > 0 && (
        <p className="error news-feed__refresh-error" role="alert">
          {error}
        </p>
      )}
      <ul className="news-feed__list">
        {items.map((item) => {
          const raw =
            item.description != null && item.description !== ''
              ? item.description
              : item.content;
          const description = stripHtml(raw);
          return (
            <li key={item.guid || item.link} className="news-card">
              <a
                className="news-card__title-link"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
              <p className="news-card__meta">
                <span>{item.author || 'Unknown author'}</span>
                <span className="news-card__meta-sep" aria-hidden="true">
                  ·
                </span>
                <time dateTime={item.pubDate || undefined}>
                  {formatPublishedDate(item.pubDate)}
                </time>
              </p>
              {description ? (
                <p className="news-card__description">{description}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
