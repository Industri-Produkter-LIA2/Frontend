export async function loadTemplate() {
  const templatePath = "/public/template.html";

  const fragment = document.getElementById('page-fragment');
  if (!fragment) throw new Error('Missing #page-fragment');

  const fragmentHTML = fragment.innerHTML;
  const fragmentTitle = fragment?.dataset?.title;

  const tplText = await fetch(templatePath).then(r => {
    if (!r.ok) throw r;
    return r.text();
  });

  const parser = new DOMParser();
  const tplDoc = parser.parseFromString(tplText, 'text/html');

  // Replace body AFTER extracting fragment
  document.body.innerHTML = tplDoc.body.innerHTML;

  const main = document.getElementById('app');
  if (!main) throw new Error('Template missing <main id="app">');

  main.innerHTML = fragmentHTML;

  if (fragmentTitle) {
    document.title = fragmentTitle;
  }
}