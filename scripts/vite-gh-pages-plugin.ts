/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const BOOT_RECOVERY_SCRIPT = `
<script>
(function () {
  var reloadKey = 'gtrans-boot-reload';
  function showBootFailure() {
    var root = document.getElementById('root');
    if (!root || root.childElementCount > 0) return;
    root.innerHTML =
      '<div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#050505;color:#fff;font-family:sans-serif;text-align:center;padding:24px">' +
      '<div><p style="margin:0 0 12px;font-size:14px">ページの読み込みに失敗しました。</p>' +
      '<p style="margin:0 0 16px;font-size:12px;color:#94a3b8">デプロイ直後はキャッシュの影響で一時的に表示されないことがあります。</p>' +
      '<button style="padding:8px 16px;border:1px solid #22d3ee;background:transparent;color:#22d3ee;border-radius:8px;cursor:pointer;font-size:12px" ' +
      'onclick="sessionStorage.removeItem(\\'' + reloadKey + '\\');location.reload()">再読み込み</button></div></div>';
  }
  window.addEventListener('load', function () {
    setTimeout(function () {
      var root = document.getElementById('root');
      if (!root || root.childElementCount > 0) return;
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        location.reload();
        return;
      }
      showBootFailure();
    }, 5000);
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) location.reload();
  });
})();
</script>`;

export function ghPagesPlugin(): Plugin {
  return {
    name: 'gtrans-gh-pages',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (process.env.GITHUB_ACTIONS !== 'true') return html;

        const withCacheMeta = html.replace(
          '<head>',
          '<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n    <meta http-equiv="Pragma" content="no-cache" />',
        );

        return withCacheMeta.replace('</body>', `${BOOT_RECOVERY_SCRIPT}\n  </body>`);
      },
    },
    closeBundle() {
      if (process.env.GITHUB_ACTIONS !== 'true') return;
      const distDir = join(process.cwd(), 'dist');
      copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'));
    },
  };
}
