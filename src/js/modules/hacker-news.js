import axios from 'axios';
import tippy from 'tippy.js';

export async function getHackerNewsPosts (hackerNewsUrl = 'https://news.ycombinator.com/rss') {
  const hackerNewsData = await axios.get(hackerNewsUrl, {
    responseType: 'document',
  })
  .then(response => {
    const items = Array.from(response.data.querySelectorAll('item'));
    const hnData = items.map(item => {
      // title, link, pubDate, comments, description
      const title = item.querySelector('title').innerHTML;
      const link = item.querySelector('link').innerHTML;
      const pubDate = item.querySelector('pubDate').innerHTML;
      return {
        title,
        link,
        pubDate,
      };
    });
    return hnData;
  });
  return hackerNewsData;
}

export async function getHackerNewsPostsMarkup () {
  const hackerNewsData = await getHackerNewsPosts();
  let idx = 0;
  const postsMarkup = hackerNewsData.map(post => {
    const listItemMarkup = `
      <li class="list-group-item list-group-item-action ${idx % 2 === 0 ? 'odd' : ''}">
        <a href="${post.link}" title="View Post: ${post.title}" target="_blank" rel="noopener">
          ${post.title}
          <br>
          <small>
            Posted ${post.pubDate}
          </small>
        </a>
      </li>
    `;
    idx += 1;
    return listItemMarkup;
  });

  const mainTemplate = `
    <ul class="list-group posts-container">
      <li class="list-group-item list-group-item-heading">
        <h5>
          <i class="fab fa-fw fa-hacker-news"></i> Hacker News Top Posts
          <small><a href="https://news.ycombinator.com/" title="View on Hacker News" target="_blank" rel="noopener"><i class="fad fa-fw fa-external-link"></i> View on Hacker News</a></small>
        </h5>
      </li>
      ${postsMarkup.join('\n')}
    </ul>
  `;
  return mainTemplate;
}

export async function initHackerNewsPopup() {
  const hackerNewsContent = await getHackerNewsPostsMarkup();
  const elForPopup = document.querySelector('.hn-popup');
  tippy(elForPopup, {
    allowHTML: true,
    interactive: true,
    maxWidth: 'none',
    trigger: 'click',
    onShow(instance) {
      instance.setContent(hackerNewsContent);
    },
  });
}