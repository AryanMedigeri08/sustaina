import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Accessibility Standards', () => {
  let html;
  
  beforeEach(() => {
    if (!html) {
      const filePath = path.resolve(__dirname, '../index.html');
      html = fs.readFileSync(filePath, 'utf8');
    }
    document.body.innerHTML = html;
  });

  it('contains a skip-to-content link', () => {
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).not.toBeNull();
    expect(skipLink.getAttribute('href')).toBe('#page-content');
  });

  it('has a main landmark', () => {
    const main = document.querySelector('main');
    expect(main).not.toBeNull();
  });

  it('ensures page-content is focusable for skip-link', () => {
    const pageContent = document.getElementById('page-content');
    expect(pageContent.getAttribute('tabindex')).toBe('-1');
  });
});
