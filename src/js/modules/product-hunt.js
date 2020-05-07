import axios from 'axios';
import tippy from 'tippy.js';

export async function getProductHuntPosts (productHuntRssUrl = 'https://www.producthunt.com/feed?category=undefined') {
  const productHuntData = await axios.get(productHuntRssUrl, {
    responseType: 'document',
  })
  .then(response => {
    console.log(response.data);
    const entries = Array.from(response.data.querySelectorAll('entry'));
    const phData = entries.map(entry => {
      // id, published, updated, title, link.href, content, author>name
      const content = entry.querySelector('content').innerHTML;
      const link = entry.querySelector('link').getAttribute('href');
      const published = entry.querySelector('published').innerHTML;
      const title = entry.querySelector('title').innerHTML;
      return {
        content,
        link,
        published,
        title,
      };
    });
    return phData;
  });
  return productHuntData;
}

export async function getProductHuntPostsMarkup () {
  const productHuntData = await getProductHuntPosts();
  console.log(productHuntData);
  let idx = 0;
  const postsMarkup = productHuntData.map(post => {
    const listItemMarkup = `
      <li class="list-group-item list-group-item-action ${idx % 2 === 0 ? 'odd' : ''}">
        <a href="${post.link}" title="View Post: ${post.title}" target="_blank" rel="noopener">
          ${post.title}
          <br>
          <small>
            Posted ${post.published}
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
          <i class="fab fa-fw fa-product-hunt"></i> Product Hunt Top Posts
          <small><a href="https://producthunt.com/" title="View on Product Hunt" target="_blank" rel="noopener"><i class="fad fa-fw fa-external-link"></i> View on Product Hunt</a></small>
        </h5>
      </li>
      ${postsMarkup.join('\n')}
    </ul>
  `;
  return mainTemplate;
}

export async function initProductHuntPopup() {
  const productHuntContent = await getProductHuntPostsMarkup();
  const elForPopup = document.querySelector('.ph-popup');
  tippy(elForPopup, {
    allowHTML: true,
    interactive: true,
    maxWidth: 'none',
    trigger: 'click',
    onShow(instance) {
      instance.setContent(productHuntContent);
    },
  });
}