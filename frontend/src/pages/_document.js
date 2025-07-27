import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Remove any loading spinners immediately
            (function() {
              var loader = document.querySelector('.app-loading');
              if (loader) {
                loader.style.display = 'none';
              }
              // Also remove by ID in case it exists
              var rootLoader = document.getElementById('root');
              if (rootLoader) {
                var appLoading = rootLoader.querySelector('.app-loading');
                if (appLoading) {
                  appLoading.remove();
                }
              }
            })();
          `
        }} />
      </body>
    </Html>
  )
}
